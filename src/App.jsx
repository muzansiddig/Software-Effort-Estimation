import { useState } from "react";
import "./index.css";

const options = {
  rely: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  data: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  cplx: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
    ["xh", "Extra High"],
  ],
  time: [
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
    ["xh", "Extra High"],
  ],
  stor: [
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
    ["xh", "Extra High"],
  ],
  virt: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
  ],
  turn: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  acap: [
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  aexp: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  pcap: [
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  vexp: [
    ["vl", "Very Low"],
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
  ],
  lexp: [
    ["vl", "Very Low"],
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
  ],
  modp: [
    ["vl", "Very Low"],
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  tool: [
    ["vl", "Very Low"],
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
    ["vh", "Very High"],
  ],
  sced: [
    ["l", "Low"],
    ["n", "Nominal"],
    ["h", "High"],
  ],
};

const initialForm = {
  projectname: "X",
  cat2: "simulation",
  forg: "g",
  center: "2",
  year: 2026,
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

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : "Prediction request failed.");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  const renderDriver = (name, title) => (
    <div className="driver" key={name}>
      <label htmlFor={name}>{title}</label>
      <select id={name} name={name} value={form[name]} onChange={handleChange}>
        {options[name].map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <div className="badge">MACHINE LEARNING</div>
            <h1>Software Effort Estimation</h1>
            <p>NASA93 Dataset · Random Forest</p>
          </div>
        </div>
      </header>

      <main className="container">
        <form onSubmit={predictEffort}>
          <section className="card">
            <div className="section-title">
              <span>01</span>
              <div>
                <h2>Project Information</h2>
                <p>General characteristics of the software project.</p>
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <label>Project Type</label>
                <input name="projectname" value={form.projectname} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Project Category</label>
                <select name="cat2" value={form.cat2} onChange={handleChange}>
                  <option value="simulation">Simulation</option>
                  <option value="communications">Communications</option>
                  <option value="utility">Utility</option>
                  <option value="science">Science</option>
                  <option value="operatingsystem">Operating System</option>
                </select>
              </div>

              <div className="field">
                <label>Organization</label>
                <select name="forg" value={form.forg} onChange={handleChange}>
                  <option value="g">Government</option>
                  <option value="f">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Development Center</label>
                <select name="center" value={form.center} onChange={handleChange}>
                  <option value="1">Center 1</option>
                  <option value="2">Center 2</option>
                  <option value="3">Center 3</option>
                  <option value="5">Center 5</option>
                  <option value="6">Center 6</option>
                </select>
              </div>

              <div className="field">
                <label>Development Year</label>
                <input type="number" name="year" value={form.year} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Development Mode</label>
                <select name="mode" value={form.mode} onChange={handleChange}>
                  <option value="organic">Organic</option>
                  <option value="semidetached">Semi-detached</option>
                  <option value="embedded">Embedded</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <span>02</span>
              <div>
                <h2>Project Size</h2>
                <p>Software size used by the estimation model.</p>
              </div>
            </div>

            <div className="size-input">
              <label>Equivalent Physical KLOC</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                name="equivphyskloc"
                value={form.equivphyskloc}
                onChange={handleChange}
                required
              />
              <span>Thousand lines of source code</span>
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <span>03</span>
              <div>
                <h2>Product Attributes</h2>
                <p>Characteristics affecting software complexity and reliability.</p>
              </div>
            </div>
            <div className="driver-grid">
              {renderDriver("rely", "RELY — Required Software Reliability")}
              {renderDriver("data", "DATA — Database Size")}
              {renderDriver("cplx", "CPLX — Product Complexity")}
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <span>04</span>
              <div>
                <h2>Computer Attributes</h2>
                <p>Characteristics of the target computing environment.</p>
              </div>
            </div>
            <div className="driver-grid">
              {renderDriver("time", "TIME — Execution Time Constraint")}
              {renderDriver("stor", "STOR — Main Storage Constraint")}
              {renderDriver("virt", "VIRT — Virtual Machine Volatility")}
              {renderDriver("turn", "TURN — Computer Turnaround Time")}
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <span>05</span>
              <div>
                <h2>Personnel Attributes</h2>
                <p>Experience and capability of the development team.</p>
              </div>
            </div>
            <div className="driver-grid">
              {renderDriver("acap", "ACAP — Analyst Capability")}
              {renderDriver("aexp", "AEXP — Applications Experience")}
              {renderDriver("pcap", "PCAP — Programmer Capability")}
              {renderDriver("vexp", "VEXP — Virtual Machine Experience")}
              {renderDriver("lexp", "LEXP — Programming Language Experience")}
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <span>06</span>
              <div>
                <h2>Project Attributes</h2>
                <p>Development environment and process characteristics.</p>
              </div>
            </div>
            <div className="driver-grid">
              {renderDriver("modp", "MODP — Modern Programming Practices")}
              {renderDriver("tool", "TOOL — Software Tools Usage")}
              {renderDriver("sced", "SCED — Required Development Schedule")}
            </div>
          </section>

          <section className="actions">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? "Estimating..." : "Estimate Software Effort"}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              Reset Form
            </button>
          </section>
        </form>

        {error && (
          <section className="error-box">
            <strong>Prediction Error</strong>
            <p>{error}</p>
          </section>
        )}

        {result && (
          <section className="result-card">
            <div className="result-label">Estimated Software Effort</div>
            <div className="result-value">{result.estimated_effort}</div>
            <div className="result-unit">Person-Months</div>
            <div className="result-details">
              <div>
                <span>Model</span>
                <strong>Random Forest</strong>
              </div>
              <div>
                <span>Dataset</span>
                <strong>NASA93</strong>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
