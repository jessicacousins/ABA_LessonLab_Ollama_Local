import React, { useEffect, useMemo, useState } from "react";
import { addPlan, loadPlans, removePlan } from "./utils/storage.js";
import { downloadLessonPDF } from "./utils/pdf.js";

const emptyForm = {
  learnerAge: "",
  learnerOverview: "",
  setting: "Adult Day Program (MA)",
  skillArea: "Communication",
  targetSkill: "",
  prerequisites: "",
  materials: "",
  sessionLength: "30 minutes",
  masteryCriteria: "80% correct across 3 consecutive sessions",
  dataCollection: "Trial-by-trial + prompt level; graph weekly",
  reinforcementPreferences: "",
  behaviorSupports: "",
  notes: "",
  tone: "Professional, warm, adult",
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toTitleCase(s) {
  return String(s || "").trim() || "ABA Lesson Plan";
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState([]);
  const [activeTab, setActiveTab] = useState("generator"); // generator | library
  const [health, setHealth] = useState(null);

  useEffect(() => {
    setSaved(loadPlans());
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const headerModel = useMemo(() => {
    if (!health?.ok) return "offline";
    return `${health.model}`;
  }, [health]);

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function generate() {
    setError("");
    setOutput("");
    setLoading(true);
    try {
      if (!String(form.targetSkill || "").trim()) {
        throw new Error(
          "Please enter a Target Skill (e.g., 'Request a break using a 2-word phrase')."
        );
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Generation failed.");
      }

      setOutput(String(data.text || "").trim());
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function saveCurrent() {
    if (!output) return;
    const title = toTitleCase(form.targetSkill);
    const plan = {
      id: uid(),
      title,
      createdAt: new Date().toISOString(),
      formSnapshot: form,
      text: output,
    };
    const plans = addPlan(plan);
    setSaved(plans);
    setActiveTab("library");
  }

  function exportPDF(plan) {
    const f = plan?.formSnapshot || form;
    const metaLines = [
      `Created: ${new Date(plan?.createdAt || Date.now()).toLocaleString()}`,
      `Model: ${health?.model || "unknown"}  |  Server: ${
        health?.ollamaUrl || "unknown"
      }`,
      `Learner age: ${f.learnerAge || "N/A"}  |  Setting: ${
        f.setting || "N/A"
      }  |  Skill area: ${f.skillArea || "N/A"}`,
      `Target skill: ${f.targetSkill || "N/A"}`,
      `Mastery criteria: ${f.masteryCriteria || "N/A"}`,
      `Data collection: ${f.dataCollection || "N/A"}`,
    ];

    downloadLessonPDF({
      title: plan?.title || toTitleCase(f.targetSkill),
      metaLines,
      bodyText: plan?.text || output,
    });
  }

  function reset() {
    setForm(emptyForm);
    setOutput("");
    setError("");
  }

  return (
    <div className="app">
      <div className="bgGlow" aria-hidden="true" />
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            <div className="logoInner" />
          </div>
          <div className="brandText">
            <h1>ABA LessonLab</h1>
            <p>Local-only curriculum writer (Ollama on your PC)</p>
          </div>
        </div>

        <div className="status">
          <div className={"pill " + (health?.ok ? "ok" : "bad")}>
            {health?.ok ? "Connected" : "Server offline"}
          </div>
          <div className="pill subtle">Model: {headerModel}</div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === "generator" ? "tab active" : "tab"}
          onClick={() => setActiveTab("generator")}
        >
          Generator
        </button>
        <button
          className={activeTab === "library" ? "tab active" : "tab"}
          onClick={() => setActiveTab("library")}
        >
          Library ({saved.length})
        </button>
        <div className="tabsSpacer" />
        <a
          className="tab link"
          href="https://ollama.com/library"
          target="_blank"
          rel="noreferrer"
        >
          Model Library ↗
        </a>
      </nav>

      {activeTab === "generator" ? (
        <main className="grid">
          <section className="card">
            <h2>Lesson plan inputs</h2>

            <div className="formGrid">
              <label className="field">
                <span>Learner age</span>
                <input
                  value={form.learnerAge}
                  onChange={(e) => update("learnerAge", e.target.value)}
                  placeholder="e.g., 27"
                />
              </label>

              <label className="field">
                <span>Setting</span>
                <input
                  value={form.setting}
                  onChange={(e) => update("setting", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Skill area</span>
                <select
                  value={form.skillArea}
                  onChange={(e) => update("skillArea", e.target.value)}
                >
                  <option>Communication</option>
                  <option>Daily Living</option>
                  <option>Community Safety</option>
                  <option>Social Skills</option>
                  <option>Employment/Vocational</option>
                  <option>Coping & Self-Regulation</option>
                  <option>Health & Hygiene</option>
                  <option>Leisure & Recreation</option>
                </select>
              </label>

              <label className="field wide">
                <span>Target skill (required)</span>
                <input
                  value={form.targetSkill}
                  onChange={(e) => update("targetSkill", e.target.value)}
                  placeholder="e.g., Request a break using a 2-word phrase ('need break')"
                />
              </label>

              <label className="field wide">
                <span>Learner overview</span>
                <textarea
                  value={form.learnerOverview}
                  onChange={(e) => update("learnerOverview", e.target.value)}
                  placeholder="Strengths, support needs, communication mode, any relevant learning history..."
                  rows={4}
                />
              </label>

              <label className="field wide">
                <span>Prerequisites</span>
                <textarea
                  value={form.prerequisites}
                  onChange={(e) => update("prerequisites", e.target.value)}
                  rows={3}
                />
              </label>

              <label className="field">
                <span>Session length</span>
                <input
                  value={form.sessionLength}
                  onChange={(e) => update("sessionLength", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Tone</span>
                <input
                  value={form.tone}
                  onChange={(e) => update("tone", e.target.value)}
                />
              </label>

              <label className="field wide">
                <span>Materials</span>
                <textarea
                  value={form.materials}
                  onChange={(e) => update("materials", e.target.value)}
                  rows={3}
                />
              </label>

              <label className="field wide">
                <span>Reinforcement preferences</span>
                <textarea
                  value={form.reinforcementPreferences}
                  onChange={(e) =>
                    update("reinforcementPreferences", e.target.value)
                  }
                  rows={3}
                />
              </label>

              <label className="field wide">
                <span>Behavior supports / considerations</span>
                <textarea
                  value={form.behaviorSupports}
                  onChange={(e) => update("behaviorSupports", e.target.value)}
                  rows={3}
                />
              </label>

              <label className="field wide">
                <span>Data collection</span>
                <textarea
                  value={form.dataCollection}
                  onChange={(e) => update("dataCollection", e.target.value)}
                  rows={2}
                />
              </label>

              <label className="field wide">
                <span>Mastery criteria</span>
                <textarea
                  value={form.masteryCriteria}
                  onChange={(e) => update("masteryCriteria", e.target.value)}
                  rows={2}
                />
              </label>

              <label className="field wide">
                <span>Additional notes</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                />
              </label>
            </div>

            <div className="actions">
              <button className="btn" disabled={loading} onClick={generate}>
                {loading ? "Generating…" : "Generate lesson plan"}
              </button>
              <button className="btn ghost" disabled={loading} onClick={reset}>
                Reset
              </button>
            </div>

            <p className="hint">
              Tip: Include prompt levels you want (e.g., “least-to-most with
              time delay”) and any safety/dignity constraints you follow.
            </p>
          </section>

          <section className="card outputCard">
            <div className="outputHeader">
              <h2>Generated plan</h2>
              <div className="outputActions">
                <button
                  className="btn subtle"
                  disabled={!output}
                  onClick={saveCurrent}
                >
                  Save
                </button>
                <button
                  className="btn subtle"
                  disabled={!output}
                  onClick={() => exportPDF(null)}
                >
                  Download PDF
                </button>
              </div>
            </div>

            {error ? <div className="error">{error}</div> : null}

            {!output ? (
              <div className="empty">
                <div className="emptyInner">
                  <div className="spark" aria-hidden="true" />
                  <p>
                    Fill in the Target Skill and click “Generate lesson plan”.
                  </p>
                  <p className="small">
                    Everything runs locally: your server calls Ollama on your
                    PC.
                  </p>
                </div>
              </div>
            ) : (
              <pre className="output">{output}</pre>
            )}
          </section>
        </main>
      ) : (
        <main className="library">
          <section className="card">
            <h2>Saved lesson plans</h2>
            {saved.length === 0 ? (
              <p className="hint">
                No saved plans yet. Generate one and click “Save”.
              </p>
            ) : (
              <div className="list">
                {saved.map((plan) => (
                  <div key={plan.id} className="item">
                    <div className="itemTop">
                      <div>
                        <div className="itemTitle">{plan.title}</div>
                        <div className="itemMeta">
                          {new Date(plan.createdAt).toLocaleString()} •{" "}
                          {plan.formSnapshot?.skillArea || "Skill"} •{" "}
                          {plan.formSnapshot?.sessionLength || "Session"}
                        </div>
                      </div>
                      <div className="itemBtns">
                        <button
                          className="btn subtle"
                          onClick={() => exportPDF(plan)}
                        >
                          PDF
                        </button>
                        <button
                          className="btn subtle"
                          onClick={() => {
                            setForm(plan.formSnapshot || emptyForm);
                            setOutput(plan.text || "");
                            setActiveTab("generator");
                          }}
                        >
                          Open
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => {
                            const next = removePlan(plan.id);
                            setSaved(next);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="itemPreview">
                      {String(plan.text || "").slice(0, 220)}
                      {String(plan.text || "").length > 220 ? "…" : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h2>Professional reminder</h2>
            <ul className="bullets">
              <li>
                Always individualize: update targets based on current data and
                preference assessments.
              </li>
              <li>
                Use PBS principles: teach replacement skills, reduce triggers,
                protect dignity, and plan for generalization.
              </li>
              <li>
                Have a BCBA/clinical lead review outputs before use in real
                programming.
              </li>
            </ul>
          </section>
        </main>
      )}

      <footer className="footer">
        <div>
          <span className="muted">
            Local-first • No cloud • You control the models.
          </span>
        </div>
        <div className="muted">© {new Date().getFullYear()} LessonLab</div>
      </footer>
    </div>
  );
}
