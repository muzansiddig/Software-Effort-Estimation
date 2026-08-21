import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialForm = {
  projectname: "X",
  cat2: "simulation",
  forg: "g",
  center: "2",
  year: 1985,
  mode: "organic",
  equivphyskloc: 50,
  rely: "n",
  data: "n",
  cplx: "n",
  time: "n",
  stor: "n",
  virt: "n",
  turn: "n",
  acap: "n",
  aexp: "n",
  pcap: "n",
  vexp: "n",
  lexp: "n",
  modp: "n",
  tool: "n",
  sced: "n",
};

const options = {
  projectname: [
    ["de", "DE - Deepspace Explorer"],
    ["erb", "ERB - Earth Remote Base"],
    ["gal", "GAL - Galileo Probe"],
    ["X", "X - Generic Project"],
    ["hst", "HST - Hubble Space Telescope"],
    ["slp", "SLP - Spacelab Payload"],
    ["Y", "Y - Research Project"],
    ["spl", "SPL - Satellite Payload"],
  ],
  cat2: [
    ["avionicsmonitoring", "Avionics Monitoring"],
    ["missionplanning", "Mission Planning"],
    ["simulation", "Simulation"],
    ["monitor_control", "Monitor & Control"],
    ["realdataprocessing", "Real Data Processing"],
    ["communications", "Communications"],
    ["batchdataprocessing", "Batch Data Processing"],
    ["datacapture", "Data Capture"],
    ["launchprocessing", "Launch Processing"],
    ["application_ground", "Application Ground"],
    ["utility", "Utility"],
    ["operatingsystem", "Operating System"],
    ["Avionics", "Avionics"],
    ["science", "Science"],
  ],
  forg: [["g", "Government"], ["f", "Flight"]],
  center: [
    ["1", "GSFC - Goddard Space Flight Center"],
    ["2", "JPL - Jet Propulsion Laboratory"],
    ["3", "JSC - Johnson Space Center"],
    ["5", "KSC - Kennedy Space Center"],
    ["6", "MSFC - Marshall Space Flight Center"],
  ],
  mode: [
    ["organic", "Organic (Team ≤ 5, Tight Requirements)"],
    ["semidetached", "Semi-Detached (Team 6-25, Medium Coupling)"],
    ["embedded", "Embedded (Team > 25, Tight Coupling)"],
  ],
  rely: [["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  data: [["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  cplx: [["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  time: [["n", "Nominal"], ["h", "High"], ["vh", "Very High"], ["xh", "Extra High"]],
  stor: [["n", "Nominal"], ["h", "High"], ["vh", "Very High"], ["xh", "Extra High"]],
  virt: [["l", "Low"], ["n", "Nominal"], ["h", "High"]],
  turn: [["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  acap: [["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  aexp: [["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  pcap: [["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  vexp: [["vl", "Very Low"], ["l", "Low"], ["n", "Nominal"], ["h", "High"]],
  lexp: [["vl", "Very Low"], ["l", "Low"], ["n", "Nominal"], ["h", "High"]],
  modp: [["vl", "Very Low"], ["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  tool: [["vl", "Very Low"], ["l", "Low"], ["n", "Nominal"], ["h", "High"], ["vh", "Very High"]],
  sced: [["l", "Low"], ["n", "Nominal"], ["h", "High"]],
};

const driverLabels = {
  rely: "RELY — Required Software Reliability",
  data: "DATA — Database Size",
  cplx: "CPLX — Product Complexity",
  time: "TIME — Execution Time Constraint",
  stor: "STOR — Main Storage Constraint",
  virt: "VIRT — Virtual Machine Volatility",
  turn: "TURN — Computer Turnaround Time",
  acap: "ACAP — Analyst Capability",
  aexp: "AEXP — Applications Experience",
  pcap: "PCAP — Programmer Capability",
  vexp: "VEXP — Virtual Machine Experience",
  lexp: "LEXP — Programming Language Experience",
  modp: "MODP — Modern Programming Practices",
  tool: "TOOL — Use of Software Tools",
  sced: "SCED — Required Development Schedule",
};

const driverTabs = [
  { id: "product", label: "Product", drivers: ["rely", "data", "cplx"] },
  { id: "computer", label: "Computer", drivers: ["time", "stor", "virt", "turn"] },
  { id: "personnel", label: "Personnel", drivers: ["acap", "aexp", "pcap", "vexp", "lexp"] },
  { id: "project", label: "Project", drivers: ["modp", "tool", "sced"] },
];

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("product");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("see-login");
    return saved ? JSON.parse(saved).isLoggedIn : false;
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return "Researcher";
    const saved = localStorage.getItem("see-login");
    if (!saved) return "Researcher";
    return JSON.parse(saved).userName || "Researcher";
  });
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("see-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Welcome to SEE Pro. Submit your project profile to estimate software effort.",
    },
  ]);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("see-history", JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("see-login", JSON.stringify({ isLoggedIn, userName: currentUser }));
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    if (!supabaseUrl || typeof window === "undefined") return;
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import("./supabaseClient.js");
        const { data } = await supabase.auth.getSession();
        if (mounted && data?.session?.user) {
          const user = data.session.user;
          setCurrentUser(user.user_metadata?.full_name || user.email || "Researcher");
          setIsLoggedIn(true);
        }
        supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if (session?.user) {
            setCurrentUser(session.user.user_metadata?.full_name || session.user.email || "Researcher");
            setIsLoggedIn(true);
            setError("");
          } else {
            setIsLoggedIn(false);
            setCurrentUser("Researcher");
          }
        });
      } catch (err) {
        console.warn("Supabase client not available", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabaseUrl]);

  const appendHistory = (estimateData) => {
    const nextEntry = {
      id: Date.now(),
      project: estimateData.projectname || form.projectname,
      mode: estimateData.mode || form.mode,
      category: estimateData.cat2 || form.cat2,
      effort: Number(estimateData.estimated_effort ?? 0),
      createdAt: new Date().toISOString(),
    };
    setHistory((previous) => [nextEntry, ...previous].slice(0, 6));
  };

  const getAuthHeaders = async () => {
    const headers = { "Content-Type": "application/json" };
    if (!supabaseUrl) return headers;
    try {
      const { supabase } = await import("./supabaseClient.js");
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Session header unavailable", error);
    }
    return headers;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "year" || name === "equivphyskloc" ? Number(value) : value,
    }));
  };

  const predictEffort = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...form,
        year: Number(form.year),
        equivphyskloc: Number(form.equivphyskloc),
      };
      const headers = await getAuthHeaders();
      const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${base}/predict`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || "Prediction failed.");
      }

      const normalizedResult = {
        ...data,
        estimated_effort: Number.isFinite(Number(data.estimated_effort)) ? Number(data.estimated_effort) : 0,
      };

      setResult(normalizedResult);
      appendHistory(normalizedResult);
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          type: "bot",
          text: `Result received: estimated effort is ${normalizedResult.estimated_effort} person-months for ${payload.projectname}.`,
        },
      ]);
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  const renderSelect = (name, label, values) => (
    <div className="field" key={name}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} value={form[name]} onChange={handleChange} className="input-select">
        {values.map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </div>
  );

  const renderDriver = (name) => renderSelect(name, driverLabels[name], options[name]);

  const handleLogin = (event) => {
    event.preventDefault();
    const trimmedEmail = loginForm.email.trim();
    if (!trimmedEmail || loginForm.password.trim().length < 4) {
      setError("Enter a valid email and password to continue.");
      return;
    }

    setLoginLoading(true);
    setError("");
    window.setTimeout(() => {
      const safeName = trimmedEmail.split("@")[0] || "Researcher";
      setCurrentUser(safeName);
      setIsLoggedIn(true);
      setLoginLoading(false);
    }, 700);
  };

  const handleLogout = async () => {
    setLoginForm({ email: "", password: "" });
    setError("");
    if (supabaseUrl) {
      try {
        const { supabase } = await import("./supabaseClient.js");
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out failed", err);
      }
    }
    setIsLoggedIn(false);
    setCurrentUser("Researcher");
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMessage = { id: Date.now(), type: "user", text };
    setMessages((previous) => [...previous, userMessage]);
    setChatInput("");

    const payloadMessages = [
      ...messages.map((message) => ({ role: message.type === "user" ? "user" : "assistant", content: message.text })),
      { role: "user", content: text },
    ];

    try {
      const headers = await getAuthHeaders();
      const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${base}/assistant/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: payloadMessages,
          project_context: result ? `Estimated effort: ${result.estimated_effort} person-months. Dataset: ${result.dataset || "NASA93"}.` : "No estimate generated yet.",
          dataset: result?.dataset || "NASA93",
        }),
      });

      const data = await response.json();
      const answer = data.reply || "I can help interpret the estimate.";
      setMessages((previous) => [...previous, { id: Date.now() + 1, type: "bot", text: answer }]);
    } catch (error) {
      let answer = "I can help interpret the model output. Please estimate a project or ask about schedule, confidence, or recommendations.";
      if (!result) {
        answer = "No estimate has been generated yet. Complete the project profile and run the prediction first.";
      } else if (/estimate|effort|people/i.test(text)) {
        answer = `Current estimate: ${result.estimated_effort} person-months.`;
      } else if (/schedule|time/i.test(text)) {
        answer = `Based on the estimate, the delivery window is about ${(result.estimated_effort / 1.5).toFixed(1)} months.`;
      }
      setMessages((previous) => [...previous, { id: Date.now() + 2, type: "bot", text: answer }]);
    }
  };

  const signInWithSupabaseGoogle = async () => {
    try {
      const { supabase } = await import("./supabaseClient.js");
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      if (error) throw error;
    } catch (err) {
      setError("Google sign-in failed: " + (err.message || err));
    }
  };

  const footerText = useMemo(() => "Academic effort prediction portal", []);

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-background">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark">SEE</div>
            <div>
              <p className="eyebrow">Academic Systems</p>
              <h1>SEE Pro</h1>
            </div>
          </div>

          <div className="auth-copy">
            <h2>Welcome back</h2>
            <p>{footerText}</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="user@university.edu"
                className="input-text"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="Enter password"
                className="input-text"
              />
            </label>

            {error && <div className="error-panel auth-error">{error}</div>}

            <button type="submit" className="btn-primary login-btn" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Access Dashboard"
              )}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button type="button" className="btn-secondary google-btn" onClick={signInWithSupabaseGoogle}>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>SEE Pro</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle" aria-label="Toggle sidebar">
            ≡
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="icon">📊</span>
            <span>Studio</span>
          </button>
          <button className="nav-item">
            <span className="icon">📁</span>
            <span>History</span>
            <span className="badge-green">{history.length}</span>
          </button>
          <button className="nav-item" onClick={() => setShowChat((value) => !value)}>
            <span className="icon">✨</span>
            <span>Assistant</span>
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <span className="icon">↩</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="welcome-pill">Welcome, {currentUser}</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="breadcrumb">
            <span>SEE Pro</span>
            <span className="separator">/</span>
            <span>Effort Studio</span>
          </div>
          <div className="top-bar-actions">
            <button type="button" className="ghost-btn">Account</button>
            <div className="welcome-pill">{currentUser}</div>
          </div>
        </header>

        <div className="workspace">
          <section className="result-panel">
            <div className="result-header">
              <h3>Estimation Results</h3>
              {result && <span className="result-badge">Live</span>}
            </div>

            {result ? (
              <>
                <div className="result-metrics">
                  <div className="metric-card">
                    <div className="metric-label">Estimated Effort</div>
                    <div className="metric-value">{Number(result.estimated_effort).toFixed(2)}</div>
                    <div className="metric-unit">Person-Months</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Schedule</div>
                    <div className="metric-value">{(result.estimated_effort / 1.5).toFixed(1)}</div>
                    <div className="metric-unit">Months</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Engineering Hours</div>
                    <div className="metric-value">{(result.estimated_effort * 152).toLocaleString()}</div>
                    <div className="metric-unit">Hours</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Staff Size</div>
                    <div className="metric-value">{Math.max(3, Math.round(result.estimated_effort / 12))}</div>
                    <div className="metric-unit">Engineers</div>
                  </div>
                </div>

                <div className="confidence-bar">
                  <div className="confidence-label">95% Confidence Interval</div>
                  <div className="confidence-range">
                    <span className="range-min">{Math.max(0, result.estimated_effort * 0.8).toFixed(1)}</span>
                    <div className="range-bar">
                      <span className="range-fill" style={{ width: "72%" }}></span>
                    </div>
                    <span className="range-max">{(result.estimated_effort * 1.2).toFixed(1)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">No estimate generated yet. Fill out the form and run prediction.</div>
            )}
          </section>

          <section className="form-section">
            <div className="section-header">
              <div>
                <h2>Project Information</h2>
                <p>Basic project characteristics</p>
              </div>
            </div>

            <form onSubmit={predictEffort} className="form-grid">
              <div className="form-column">
                {renderSelect("projectname", "Project Name", options.projectname)}
                {renderSelect("cat2", "Category", options.cat2)}
                {renderSelect("forg", "Organization", options.forg)}
                {renderSelect("center", "Center", options.center)}

                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input id="year" name="year" type="number" value={form.year} onChange={handleChange} className="input-text" />
                </div>

                {renderSelect("mode", "Development Mode", options.mode)}
              </div>

              <div className="form-column">
                <div className="field">
                  <label htmlFor="equivphyskloc">Equivalent Physical KLOC</label>
                  <input id="equivphyskloc" name="equivphyskloc" type="number" value={form.equivphyskloc} onChange={handleChange} className="input-text" />
                </div>
              </div>
            </form>

            <div className="section-header section-split">
              <div>
                <h2>Project Size</h2>
                <p>Estimated software size</p>
              </div>
            </div>

            <div className="driver-tabs">
              {driverTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="driver-grid">
              {driverTabs
                .find((tab) => tab.id === activeTab)
                .drivers.map((driverName) => renderDriver(driverName))}
            </div>

            {error && <div className="error-panel">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={predictEffort} disabled={loading}>
                {loading ? "Calculating..." : "Estimate Effort"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Reset
              </button>
            </div>
          </section>

          {showChat && (
            <section className="assistant-panel">
              <div className="assistant-header">
                <h3>Academic Copilot</h3>
              </div>

              <div className="assistant-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    {message.text}
                  </div>
                ))}
              </div>

              <form className="chat-form" onSubmit={handleChatSubmit}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask about the estimate..."
                  className="input-text"
                />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </section>
          )}

          <section className="history-panel">
            <div className="history-header">
              <h3>Recent History</h3>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-state small">No previous estimates yet.</div>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <div>
                      <div className="history-title">{entry.project}</div>
                      <div className="history-meta">{entry.category} • {entry.mode}</div>
                    </div>
                    <div className="history-effort">{entry.effort.toFixed(2)} PM</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
