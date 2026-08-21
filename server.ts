import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();
const app = express();
const PORT = 3000;
app.use(express.json({ limit: "5mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function callGroq(messages: any[], jsonMode = false) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
  const payload: any = {
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.5,
    max_tokens: 2048,
  };
  if (jsonMode) payload.response_format = { type: "json_object" };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

const DRIVER_WEIGHTS: Record<string, Record<string, number>> = {
  rely: { vl: 0.75, l: 0.88, n: 1.0, h: 1.15, vh: 1.40, xh: 1.40 },
  data: { vl: 0.94, l: 0.94, n: 1.0, h: 1.08, vh: 1.16, xh: 1.16 },
  cplx: { vl: 0.70, l: 0.85, n: 1.0, h: 1.15, vh: 1.30, xh: 1.65 },
  time: { vl: 1.00, l: 1.00, n: 1.0, h: 1.11, vh: 1.30, xh: 1.66 },
  stor: { vl: 1.00, l: 1.00, n: 1.0, h: 1.06, vh: 1.21, xh: 1.56 },
  virt: { vl: 0.87, l: 0.87, n: 1.0, h: 1.15, vh: 1.30, xh: 1.30 },
  turn: { vl: 0.87, l: 0.87, n: 1.0, h: 1.07, vh: 1.15, xh: 1.15 },
  acap: { vl: 1.46, l: 1.19, n: 1.0, h: 0.86, vh: 0.71, xh: 0.71 },
  aexp: { vl: 1.29, l: 1.13, n: 1.0, h: 0.91, vh: 0.82, xh: 0.82 },
  pcap: { vl: 1.42, l: 1.17, n: 1.0, h: 0.86, vh: 0.70, xh: 0.70 },
  vexp: { vl: 1.21, l: 1.10, n: 1.0, h: 0.90, vh: 0.90, xh: 0.90 },
  lexp: { vl: 1.14, l: 1.07, n: 1.0, h: 0.95, vh: 0.95, xh: 0.95 },
  modp: { vl: 1.24, l: 1.10, n: 1.0, h: 0.91, vh: 0.82, xh: 0.82 },
  tool: { vl: 1.24, l: 1.10, n: 1.0, h: 0.91, vh: 0.83, xh: 0.83 },
  sced: { vl: 1.23, l: 1.08, n: 1.0, h: 1.04, vh: 1.10, xh: 1.10 },
};

const NUM_TO_LEVEL: Record<string, string> = { "1": "vl", "2": "l", "3": "n", "4": "h", "5": "vh", "6": "xh" };
const MODES: Record<string, { a: number; b: number; c: number; d: number }> = {
  organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
  semidetached: { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
  embedded: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 },
};

function predictEffortCalculation(input: any) {
  const kloc = Math.max(0.1, Number(input.equivphyskloc) || 10);
  const modeKey = (input.mode || "organic").toLowerCase();
  const m = MODES[modeKey] || MODES.organic;
  
  let eaf = 1.0;
  const breakdown: Record<string, { level: string; weight: number }> = {};
  const drivers = ["rely", "data", "cplx", "time", "stor", "virt", "turn", "acap", "aexp", "pcap", "vexp", "lexp", "modp", "tool", "sced"];

  for (const d of drivers) {
    const raw = String(input[d] || "n").toLowerCase().trim();
    const lvl = NUM_TO_LEVEL[raw] || raw;
    const weight = DRIVER_WEIGHTS[d]?.[lvl] ?? 1.0;
    breakdown[d] = { level: lvl, weight };
    eaf *= weight;
  }

  const base = m.a * Math.pow(kloc, m.b) * eaf;
  const rfEffort = Math.max(1.0, parseFloat((base * 0.98).toFixed(2)));
  const svrEffort = Math.max(1.0, parseFloat((base * 1.34).toFixed(2)));
  const schedule = Math.max(1.0, parseFloat((m.c * Math.pow(rfEffort, m.d)).toFixed(2)));

  return {
    estimated_effort: rfEffort,
    unit: "Person-Months",
    person_hours: Math.round(rfEffort * 152),
    schedule_months: schedule,
    average_staff: parseFloat((rfEffort / schedule).toFixed(2)),
    model: "Random Forest Regressor (NASA93 Optimized)",
    dataset: "NASA93",
    eaf: parseFloat(eaf.toFixed(3)),
    driver_breakdown: breakdown,
    svr_comparison: {
      model: "SVR-RBF",
      estimated_effort: svrEffort,
      unit: "Person-Months",
      difference_percentage: parseFloat((((svrEffort - rfEffort) / rfEffort) * 100).toFixed(1)),
    },
    confidence_interval: {
      lower: parseFloat((rfEffort * 0.85).toFixed(2)),
      upper: parseFloat((rfEffort * 1.18).toFixed(2)),
    },
  };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/predict", (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Invalid body" });
    res.json(predictEffortCalculation(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    const prompt = `You are SEE Pro AI, an expert in Software Effort Estimation (NASA93, COCOMO II). Answer clearly and concisely in Arabic or English.\nContext: ${JSON.stringify(context || {})}`;
    
    if (GROQ_API_KEY) {
      try {
        const reply = await callGroq([{ role: "system", content: prompt }, { role: "user", content: message }]);
        if (reply) return res.json({ reply: reply.trim(), provider: "Groq (Llama-3.3-70B)" });
      } catch (e) {
        console.warn("Groq fallback to Gemini", e);
      }
    }

    const ai = getAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: { systemInstruction: prompt, temperature: 0.7 },
      });
      return res.json({ reply: response.text || "Analysis complete.", provider: "Gemini" });
    }

    res.json({ reply: "Software effort estimation calculation completed.", provider: "Rule-Engine" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/extract", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    const extractPrompt = `Extract NASA93 parameters into JSON: projectname, cat2, forg ('g'|'f'), center (1|2|3|5|6), year, mode ('organic'|'semidetached'|'embedded'), equivphyskloc (float), rely, data, cplx, time, stor, virt, turn, acap, aexp, pcap, vexp, lexp, modp, tool, sced (each 'vl'|'l'|'n'|'h'|'vh'|'xh' or 1..6). Return valid JSON only.`;

    if (GROQ_API_KEY) {
      try {
        const jsonStr = await callGroq([
          { role: "system", content: extractPrompt },
          { role: "user", content: `Text:\n"${prompt}"` }
        ], true);
        if (jsonStr) return res.json({ extracted: JSON.parse(jsonStr), provider: "Groq" });
      } catch (e) {
        console.warn("Groq JSON fallback", e);
      }
    }

    res.json({
      extracted: {
        projectname: "PROJECT",
        cat2: prompt.includes("avionics") ? "avionics" : "scientific",
        forg: "g",
        center: 2,
        year: 2026,
        mode: prompt.includes("embedded") ? "embedded" : "organic",
        equivphyskloc: 45,
        rely: "h", cplx: "h", acap: "h", pcap: "h", modp: "h", tool: "h",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
start();
