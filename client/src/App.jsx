// import React, { useEffect, useMemo, useState } from "react";
// import { addPlan, loadPlans, removePlan } from "./utils/storage.js";
// import { downloadLessonPDF } from "./utils/pdf.js";

// const emptyForm = {
//   learnerAge: "",
//   learnerOverview: "",
//   setting: "Adult Day Program (MA)",
//   skillArea: "Communication",
//   targetSkill: "",
//   prerequisites: "",
//   materials: "",
//   sessionLength: "30 minutes",
//   masteryCriteria: "80% correct across 3 consecutive sessions",
//   dataCollection: "Trial-by-trial + prompt level; graph weekly",
//   reinforcementPreferences: "",
//   behaviorSupports: "",
//   notes: "",
//   tone: "Professional, warm, adult",
// };

// function uid() {
//   return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
// }

// function toTitleCase(s) {
//   return String(s || "").trim() || "ABA Lesson Plan";
// }

// function getInitialTheme() {
//   try {
//     const saved = localStorage.getItem("lessonlab_theme_v1");
//     if (saved === "light" || saved === "dark") return saved;
//   } catch {}
//   // Default to system preference if no saved theme
//   try {
//     if (
//       window.matchMedia &&
//       window.matchMedia("(prefers-color-scheme: light)").matches
//     ) {
//       return "light";
//     }
//   } catch {}
//   return "dark";
// }

// export default function App() {
//   const [form, setForm] = useState(emptyForm);
//   const [loading, setLoading] = useState(false);
//   const [output, setOutput] = useState("");
//   const [error, setError] = useState("");
//   const [saved, setSaved] = useState([]);
//   const [activeTab, setActiveTab] = useState("generator"); // generator | library
//   const [health, setHealth] = useState(null);

//   const [theme, setTheme] = useState(getInitialTheme);

//   useEffect(() => {
//     setSaved(loadPlans());
//   }, []);

//   useEffect(() => {
//     fetch("/api/health")
//       .then((r) => r.json())
//       .then(setHealth)
//       .catch(() => setHealth(null));
//   }, []);

//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     try {
//       localStorage.setItem("lessonlab_theme_v1", theme);
//     } catch {}
//   }, [theme]);

//   const headerModel = useMemo(() => {
//     if (!health?.ok) return "offline";
//     return `${health.model}`;
//   }, [health]);

//   function toggleTheme() {
//     setTheme((t) => (t === "dark" ? "light" : "dark"));
//   }

//   function update(k, v) {
//     setForm((prev) => ({ ...prev, [k]: v }));
//   }

//   async function generate() {
//     setError("");
//     setOutput("");
//     setLoading(true);
//     try {
//       if (!String(form.targetSkill || "").trim()) {
//         throw new Error(
//           "Please enter a Target Skill (e.g., 'Request a break using a 2-word phrase')."
//         );
//       }

//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json().catch(() => null);
//       if (!res.ok || !data?.ok) {
//         throw new Error(data?.error || "Generation failed.");
//       }

//       setOutput(String(data.text || "").trim());
//     } catch (e) {
//       setError(e?.message || String(e));
//     } finally {
//       setLoading(false);
//     }
//   }

//   function saveCurrent() {
//     if (!output) return;
//     const title = toTitleCase(form.targetSkill);
//     const plan = {
//       id: uid(),
//       title,
//       createdAt: new Date().toISOString(),
//       formSnapshot: form,
//       text: output,
//     };
//     const plans = addPlan(plan);
//     setSaved(plans);
//     setActiveTab("library");
//   }

//   function exportPDF(plan) {
//     const f = plan?.formSnapshot || form;
//     const metaLines = [
//       `Created: ${new Date(plan?.createdAt || Date.now()).toLocaleString()}`,
//       `Model: ${health?.model || "unknown"}  |  Server: ${
//         health?.ollamaUrl || "unknown"
//       }`,
//       `Learner age: ${f.learnerAge || "N/A"}  |  Setting: ${
//         f.setting || "N/A"
//       }  |  Skill area: ${f.skillArea || "N/A"}`,
//       `Target skill: ${f.targetSkill || "N/A"}`,
//       `Mastery criteria: ${f.masteryCriteria || "N/A"}`,
//       `Data collection: ${f.dataCollection || "N/A"}`,
//     ];

//     downloadLessonPDF({
//       title: plan?.title || toTitleCase(f.targetSkill),
//       metaLines,
//       bodyText: plan?.text || output,
//     });
//   }

//   function reset() {
//     setForm(emptyForm);
//     setOutput("");
//     setError("");
//   }

//   return (
//     <div className="app">
//       <div className="bgGlow" aria-hidden="true" />
//       <header className="header">
//         <div className="brand">
//           <div className="logo" aria-hidden="true">
//             <div className="logoInner" />
//           </div>
//           <div className="brandText">
//             <h1>ABA LessonLab</h1>
//             <p>Local-only curriculum writer (Ollama on your PC)</p>
//           </div>
//         </div>

//         <div className="status">
//           <button
//             type="button"
//             className="pill pillBtn"
//             onClick={toggleTheme}
//             aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
//             title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
//           >
//             {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
//           </button>

//           <div className={"pill " + (health?.ok ? "ok" : "bad")}>
//             {health?.ok ? "Connected" : "Server offline"}
//           </div>
//           <div className="pill subtle">Model: {headerModel}</div>
//         </div>
//       </header>

//       <nav className="tabs">
//         <button
//           className={activeTab === "generator" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("generator")}
//         >
//           Generator
//         </button>
//         <button
//           className={activeTab === "library" ? "tab active" : "tab"}
//           onClick={() => setActiveTab("library")}
//         >
//           Library ({saved.length})
//         </button>
//         <div className="tabsSpacer" />
//         <a
//           className="tab link"
//           href="https://ollama.com/library"
//           target="_blank"
//           rel="noreferrer"
//         >
//           Model Library ↗
//         </a>
//       </nav>

//       {activeTab === "generator" ? (
//         <main className="grid">
//           <section className="card">
//             <h2>Lesson plan inputs</h2>

//             <div className="formGrid">
//               <label className="field">
//                 <span>Learner age</span>
//                 <input
//                   value={form.learnerAge}
//                   onChange={(e) => update("learnerAge", e.target.value)}
//                   placeholder="e.g., 27"
//                 />
//               </label>

//               <label className="field">
//                 <span>Setting</span>
//                 <input
//                   value={form.setting}
//                   onChange={(e) => update("setting", e.target.value)}
//                 />
//               </label>

//               <label className="field">
//                 <span>Skill area</span>
//                 <select
//                   value={form.skillArea}
//                   onChange={(e) => update("skillArea", e.target.value)}
//                 >
//                   <option>Communication</option>
//                   <option>Daily Living</option>
//                   <option>Community Safety</option>
//                   <option>Social Skills</option>
//                   <option>Employment/Vocational</option>
//                   <option>Coping & Self-Regulation</option>
//                   <option>Health & Hygiene</option>
//                   <option>Leisure & Recreation</option>
//                 </select>
//               </label>

//               <label className="field wide">
//                 <span>Target skill (required)</span>
//                 <input
//                   value={form.targetSkill}
//                   onChange={(e) => update("targetSkill", e.target.value)}
//                   placeholder="e.g., Request a break using a 2-word phrase ('need break')"
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Learner overview</span>
//                 <textarea
//                   value={form.learnerOverview}
//                   onChange={(e) => update("learnerOverview", e.target.value)}
//                   placeholder="Strengths, support needs, communication mode, any relevant learning history..."
//                   rows={4}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Prerequisites</span>
//                 <textarea
//                   value={form.prerequisites}
//                   onChange={(e) => update("prerequisites", e.target.value)}
//                   rows={3}
//                 />
//               </label>

//               <label className="field">
//                 <span>Session length</span>
//                 <input
//                   value={form.sessionLength}
//                   onChange={(e) => update("sessionLength", e.target.value)}
//                 />
//               </label>

//               <label className="field">
//                 <span>Tone</span>
//                 <input
//                   value={form.tone}
//                   onChange={(e) => update("tone", e.target.value)}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Materials</span>
//                 <textarea
//                   value={form.materials}
//                   onChange={(e) => update("materials", e.target.value)}
//                   rows={3}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Reinforcement preferences</span>
//                 <textarea
//                   value={form.reinforcementPreferences}
//                   onChange={(e) =>
//                     update("reinforcementPreferences", e.target.value)
//                   }
//                   rows={3}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Behavior supports / considerations</span>
//                 <textarea
//                   value={form.behaviorSupports}
//                   onChange={(e) => update("behaviorSupports", e.target.value)}
//                   rows={3}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Data collection</span>
//                 <textarea
//                   value={form.dataCollection}
//                   onChange={(e) => update("dataCollection", e.target.value)}
//                   rows={2}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Mastery criteria</span>
//                 <textarea
//                   value={form.masteryCriteria}
//                   onChange={(e) => update("masteryCriteria", e.target.value)}
//                   rows={2}
//                 />
//               </label>

//               <label className="field wide">
//                 <span>Additional notes</span>
//                 <textarea
//                   value={form.notes}
//                   onChange={(e) => update("notes", e.target.value)}
//                   rows={3}
//                 />
//               </label>
//             </div>

//             <div className="actions">
//               <button className="btn" disabled={loading} onClick={generate}>
//                 {loading ? "Generating…" : "Generate lesson plan"}
//               </button>
//               <button className="btn ghost" disabled={loading} onClick={reset}>
//                 Reset
//               </button>
//             </div>

//             <p className="hint">
//               Tip: Include prompt levels you want (e.g., “least-to-most with
//               time delay”) and any safety/dignity constraints you follow.
//             </p>
//           </section>

//           <section className="card outputCard">
//             <div className="outputHeader">
//               <h2>Generated plan</h2>
//               <div className="outputActions">
//                 <button
//                   className="btn subtle"
//                   disabled={!output}
//                   onClick={saveCurrent}
//                 >
//                   Save
//                 </button>
//                 <button
//                   className="btn subtle"
//                   disabled={!output}
//                   onClick={() => exportPDF(null)}
//                 >
//                   Download PDF
//                 </button>
//               </div>
//             </div>

//             {error ? <div className="error">{error}</div> : null}

//             {!output ? (
//               <div className="empty">
//                 <div className="emptyInner">
//                   <div className="spark" aria-hidden="true" />
//                   <p>
//                     Fill in the Target Skill and click “Generate lesson plan”.
//                   </p>
//                   <p className="small">
//                     Everything runs locally: your server calls Ollama on your
//                     PC.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <pre className="output">{output}</pre>
//             )}
//           </section>
//         </main>
//       ) : (
//         <main className="library">
//           <section className="card">
//             <h2>Saved lesson plans</h2>
//             {saved.length === 0 ? (
//               <p className="hint">
//                 No saved plans yet. Generate one and click “Save”.
//               </p>
//             ) : (
//               <div className="list">
//                 {saved.map((plan) => (
//                   <div key={plan.id} className="item">
//                     <div className="itemTop">
//                       <div>
//                         <div className="itemTitle">{plan.title}</div>
//                         <div className="itemMeta">
//                           {new Date(plan.createdAt).toLocaleString()} •{" "}
//                           {plan.formSnapshot?.skillArea || "Skill"} •{" "}
//                           {plan.formSnapshot?.sessionLength || "Session"}
//                         </div>
//                       </div>
//                       <div className="itemBtns">
//                         <button
//                           className="btn subtle"
//                           onClick={() => exportPDF(plan)}
//                         >
//                           PDF
//                         </button>
//                         <button
//                           className="btn subtle"
//                           onClick={() => {
//                             setForm(plan.formSnapshot || emptyForm);
//                             setOutput(plan.text || "");
//                             setActiveTab("generator");
//                           }}
//                         >
//                           Open
//                         </button>
//                         <button
//                           className="btn danger"
//                           onClick={() => {
//                             const next = removePlan(plan.id);
//                             setSaved(next);
//                           }}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>

//                     <div className="itemPreview">
//                       {String(plan.text || "").slice(0, 220)}
//                       {String(plan.text || "").length > 220 ? "…" : ""}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>

//           <section className="card">
//             <h2>Professional reminder</h2>
//             <ul className="bullets">
//               <li>
//                 Always individualize: update targets based on current data and
//                 preference assessments.
//               </li>
//               <li>
//                 Use PBS principles: teach replacement skills, reduce triggers,
//                 protect dignity, and plan for generalization.
//               </li>
//               <li>
//                 Have a BCBA/clinical lead review outputs before use in real
//                 programming.
//               </li>
//             </ul>
//           </section>
//         </main>
//       )}

//       <footer className="footer">
//         <div>
//           <span className="muted">
//             Local-first • No cloud • You control the models.
//           </span>
//         </div>
//         <div className="muted">© {new Date().getFullYear()} LessonLab</div>
//       </footer>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import { addPlan, loadPlans, removePlan } from "./utils/storage.js";
import { downloadLessonPDF } from "./utils/pdf.js";

const SKILL_AREAS = [
  "Communication & AAC (Speech/SLP)",
  "OT: Daily Living, Fine Motor & Sensory Supports",
  "PT: Mobility, Endurance & Physical Wellness",
  "Behavioral Health & Positive Behavior Supports (PBS)",
  "Human Rights, Self-Advocacy & Informed Choice",
  "Health, Wellness & Medication Self-Management",
  "Safety, Risk Reduction & Community Access",
  "Social Relationships & Community Inclusion",
  "Employment, Vocational & Job Coaching",
  "Executive Functioning, Routines & Independence",
  "Leisure, Recreation & Quality of Life",
  "Coping, Emotional Regulation & Trauma-Informed Skills",
];

const SECONDARY_AREAS = [
  "Human Rights safeguards / restrictions review",
  "OT consultation (sensory, task adaptation)",
  "PT consultation (mobility, positioning, endurance)",
  "Speech/SLP consultation (AAC, pragmatic language)",
  "Behavioral Health / BCBA oversight",
  "Nursing/medical coordination",
  "Community inclusion & accessibility",
  "Vocational profile & job-site generalization",
  "Transportation training",
  "Supported decision-making / guardianship coordination",
  "Cultural & linguistic responsiveness",
  "Assistive technology & digital literacy",
  "Safety planning (elopement, choking, seizures, allergies)",
  "Trauma-informed supports",
];

const DISCIPLINES = [
  "Direct Support Professional (DSP)",
  "BCBA / Behavioral Health",
  "Occupational Therapy (OT)",
  "Physical Therapy (PT)",
  "Speech-Language Pathology (SLP)",
  "Nursing / Medical",
  "Employment Specialist / Job Coach",
  "Peer Mentor / Self-Advocate",
  "Clinical Lead / Supervisor",
];

const emptyForm = {
  // REQUIRED
  createdBy: "",
  staffingRatio: "",

  // Program context
  serviceType: "DDS + MassHealth aligned (braided services)",
  serviceDelivery: "Hybrid (center + community)",
  setting: "Adult Day Program (MA)",
  sessionLength: "30 minutes",

  // Learner snapshot
  learnerAge: "",
  learnerOverview: "",
  communicationMode: "",
  mobilityNeeds: "",
  sensoryProfile: "",

  // Scope
  skillArea: SKILL_AREAS[0],
  secondaryAreas: [],
  disciplines: [],

  // Target + teaching
  targetSkill: "",
  prerequisites: "",
  materials: "",

  // Behavior/health/rights
  reinforcementPreferences: "",
  behaviorSupports: "",
  healthSafetyRisks: "",
  rightsConsiderations: "",

  // Measurement
  masteryCriteria: "80% correct across 3 consecutive sessions",
  dataCollection: "Trial-by-trial + prompt level; graph weekly",

  // Other
  notes: "",
  tone: "Professional, warm, adult",
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toTitleCase(s) {
  return String(s || "").trim() || "ABA Lesson Plan";
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("lessonlab_theme_v1");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
  } catch {}
  return "dark";
}

function getInitialView() {
  try {
    const saved = localStorage.getItem("lessonlab_view_v1");
    if (saved === "standard" || saved === "projector") return saved;
  } catch {}
  return "standard";
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState([]);
  const [activeTab, setActiveTab] = useState("generator"); // generator | library
  const [health, setHealth] = useState(null);

  const [theme, setTheme] = useState(getInitialTheme);
  const [view, setView] = useState(getInitialView);

  useEffect(() => {
    setSaved(loadPlans());
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("lessonlab_theme_v1", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-view", view);
    try {
      localStorage.setItem("lessonlab_view_v1", view);
    } catch {}
  }, [view]);

  const headerModel = useMemo(() => {
    if (!health?.ok) return "offline";
    return `${health.model}`;
  }, [health]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function toggleView() {
    setView((v) => (v === "standard" ? "projector" : "standard"));
  }

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function toggleArrayValue(key, value) {
    setForm((prev) => {
      const arr = Array.isArray(prev[key]) ? prev[key] : [];
      const has = arr.includes(value);
      const next = has ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  }

  async function generate() {
    setError("");
    setOutput("");
    setLoading(true);
    try {
      if (!String(form.createdBy || "").trim()) {
        throw new Error(
          "Created By is required (so plans are attributable to a staff member).",
        );
      }
      if (!String(form.staffingRatio || "").trim()) {
        throw new Error(
          "Staffing Ratio is required (e.g., 1:3 staff:clients, or 2:8).",
        );
      }
      if (!String(form.targetSkill || "").trim()) {
        throw new Error(
          "Please enter a Target Skill (e.g., 'Request a break using a 2-word phrase').",
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
      `Created by: ${f.createdBy || "N/A"}  |  Staffing ratio (staff:clients): ${
        f.staffingRatio || "N/A"
      }`,
      `Service: ${f.serviceType || "N/A"}  |  Delivery: ${f.serviceDelivery || "N/A"}`,
      `Model: ${health?.model || "unknown"}  |  Server: ${health?.ollamaUrl || "unknown"}`,
      `Setting: ${f.setting || "N/A"}  |  Session length: ${f.sessionLength || "N/A"}`,
      `Learner age: ${f.learnerAge || "N/A"}  |  Skill area: ${f.skillArea || "N/A"}`,
      `Disciplines: ${(f.disciplines || []).join(", ") || "N/A"}`,
      `Secondary focus: ${(f.secondaryAreas || []).join(", ") || "N/A"}`,
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

  const connectionPill = health?.ok ? "Connected" : "Server offline";

  return (
    <div className="app">
      <div className="bgGlow" aria-hidden="true" />

      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            <div className="logoInner" />
          </div>
          <div className="brandText">
            <h1>LessonLab</h1>
            <p>
              ABA + PBS curriculum builder for MA Adult Day Programs (local
              Ollama)
            </p>
          </div>
        </div>

        <div className="status">
          <button
            type="button"
            className="pill pillBtn"
            onClick={toggleView}
            aria-label={`Switch to ${view === "standard" ? "projector" : "standard"} view`}
            title={`Switch to ${view === "standard" ? "projector" : "standard"} view`}
          >
            {view === "standard" ? "Projector view" : "Standard view"}
          </button>

          <button
            type="button"
            className="pill pillBtn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Dark" : "Light"}
          </button>

          <div className={"pill " + (health?.ok ? "ok" : "bad")}>
            {connectionPill}
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
                <span className="req">Created by (required)</span>
                <input
                  value={form.createdBy}
                  onChange={(e) => update("createdBy", e.target.value)}
                  placeholder="e.g., J. Cousins, BCBA / Clinical Lead"
                />
                <div className="help">
                  This appears on the plan and helps teams track who generated
                  drafts.
                </div>
              </label>

              <label className="field">
                <span className="req">Staffing ratio (required)</span>
                <input
                  value={form.staffingRatio}
                  onChange={(e) => update("staffingRatio", e.target.value)}
                  placeholder="e.g., 1:3 (staff:clients) or 1:1"
                />
                <div className="help">
                  Include any critical nuance (e.g., 1:1 during community
                  access).
                </div>
              </label>

              <label className="field">
                <span>Service type</span>
                <select
                  value={form.serviceType}
                  onChange={(e) => update("serviceType", e.target.value)}
                >
                  <option>DDS + MassHealth aligned (braided services)</option>
                  <option>DDS Day Supports / Day & Employment focus</option>
                  <option>MassHealth Day Habilitation focus</option>
                  <option>
                    Employment-focused (supported employment / job coaching)
                  </option>
                  <option>Community-based day supports focus</option>
                </select>
              </label>

              <label className="field">
                <span>Service delivery</span>
                <select
                  value={form.serviceDelivery}
                  onChange={(e) => update("serviceDelivery", e.target.value)}
                >
                  <option>Hybrid (center + community)</option>
                  <option>Center-based</option>
                  <option>Community-based</option>
                </select>
              </label>

              <label className="field">
                <span>Setting</span>
                <input
                  value={form.setting}
                  onChange={(e) => update("setting", e.target.value)}
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
                <span>Learner age</span>
                <input
                  value={form.learnerAge}
                  onChange={(e) => update("learnerAge", e.target.value)}
                  placeholder="e.g., 27"
                />
              </label>

              <label className="field wide">
                <span>Learner overview</span>
                <textarea
                  value={form.learnerOverview}
                  onChange={(e) => update("learnerOverview", e.target.value)}
                  rows={3}
                  placeholder="Strengths, needs, motivators, current supports, relevant history, baseline notes."
                />
              </label>

              <label className="field">
                <span>Communication mode / AAC</span>
                <input
                  value={form.communicationMode}
                  onChange={(e) => update("communicationMode", e.target.value)}
                  placeholder="e.g., verbal + AAC; SGD; PECS; sign; gestures"
                />
              </label>

              <label className="field">
                <span>Mobility / physical supports</span>
                <input
                  value={form.mobilityNeeds}
                  onChange={(e) => update("mobilityNeeds", e.target.value)}
                  placeholder="e.g., ambulatory; walker; wheelchair; transfers; fatigue"
                />
              </label>

              <label className="field wide">
                <span>Sensory profile / regulation needs</span>
                <textarea
                  value={form.sensoryProfile}
                  onChange={(e) => update("sensoryProfile", e.target.value)}
                  rows={2}
                  placeholder="Sensory triggers, supports, break needs, noise tolerance, preferred calming strategies."
                />
              </label>

              <label className="field">
                <span>Primary skill area</span>
                <select
                  value={form.skillArea}
                  onChange={(e) => update("skillArea", e.target.value)}
                >
                  {SKILL_AREAS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="field wide">
                <span className="req">Target skill (required)</span>
                <textarea
                  value={form.targetSkill}
                  onChange={(e) => update("targetSkill", e.target.value)}
                  rows={2}
                  placeholder="Write like a measurable goal: who does what, when, and how well."
                />
                <div className="help">
                  Best practice: include context + measurable criteria
                  (accuracy, independence, prompt level).
                </div>
              </label>

              <details className="details wide">
                <summary className="summary">
                  Advanced: therapies, human rights, and secondary focus
                </summary>

                <div className="subgrid">
                  <div className="block">
                    <div className="blockTitle">Disciplines involved</div>
                    <div className="checks">
                      {DISCIPLINES.map((d) => (
                        <label key={d} className="checkItem">
                          <input
                            type="checkbox"
                            checked={(form.disciplines || []).includes(d)}
                            onChange={() => toggleArrayValue("disciplines", d)}
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                    <div className="help">
                      Helps the generator integrate OT/PT/SLP/Behavioral Health,
                      role clarity, and handoffs.
                    </div>
                  </div>

                  <div className="block">
                    <div className="blockTitle">Secondary focus areas</div>
                    <div className="checks">
                      {SECONDARY_AREAS.map((a) => (
                        <label key={a} className="checkItem">
                          <input
                            type="checkbox"
                            checked={(form.secondaryAreas || []).includes(a)}
                            onChange={() =>
                              toggleArrayValue("secondaryAreas", a)
                            }
                          />
                          <span>{a}</span>
                        </label>
                      ))}
                    </div>
                    <div className="help">
                      Use these when you want the plan to explicitly include
                      Human Rights, accessibility, or therapy coordination.
                    </div>
                  </div>
                </div>
              </details>

              <label className="field">
                <span>Prerequisites / baseline</span>
                <textarea
                  value={form.prerequisites}
                  onChange={(e) => update("prerequisites", e.target.value)}
                  rows={2}
                  placeholder="Current baseline, prerequisite skills, prompt level, known barriers."
                />
              </label>

              <label className="field">
                <span>Materials</span>
                <textarea
                  value={form.materials}
                  onChange={(e) => update("materials", e.target.value)}
                  rows={2}
                  placeholder="Real-world materials, adaptive tools, AAC items, visual schedules, etc."
                />
              </label>

              <label className="field">
                <span>Reinforcement preferences</span>
                <textarea
                  value={form.reinforcementPreferences}
                  onChange={(e) =>
                    update("reinforcementPreferences", e.target.value)
                  }
                  rows={2}
                  placeholder="Preference assessment highlights, what actually works, what to avoid."
                />
              </label>

              <label className="field">
                <span>PBS / behavioral considerations</span>
                <textarea
                  value={form.behaviorSupports}
                  onChange={(e) => update("behaviorSupports", e.target.value)}
                  rows={2}
                  placeholder="Known functions, replacement skills, proactive strategies, de-escalation, reinforcement plan."
                />
              </label>

              <label className="field wide">
                <span>Health & safety risks</span>
                <textarea
                  value={form.healthSafetyRisks}
                  onChange={(e) => update("healthSafetyRisks", e.target.value)}
                  rows={2}
                  placeholder="Seizures, choking, aspiration risk, allergies, elopement, falls, diabetes, meds, etc."
                />
              </label>

              <label className="field wide">
                <span>
                  Human rights / consent / restrictions considerations
                </span>
                <textarea
                  value={form.rightsConsiderations}
                  onChange={(e) =>
                    update("rightsConsiderations", e.target.value)
                  }
                  rows={2}
                  placeholder="Guardianship/consent, dignity safeguards, rights restrictions, privacy, least restrictive supports."
                />
              </label>

              <label className="field">
                <span>Data collection</span>
                <input
                  value={form.dataCollection}
                  onChange={(e) => update("dataCollection", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Mastery criteria</span>
                <input
                  value={form.masteryCriteria}
                  onChange={(e) => update("masteryCriteria", e.target.value)}
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

              <label className="field wide">
                <span>Desired tone</span>
                <input
                  value={form.tone}
                  onChange={(e) => update("tone", e.target.value)}
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
              Tip: The more you include about rights, risks, and therapy
              coordination, the more “audit-ready” the output becomes.
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
                  <p>Fill required fields and click “Generate lesson plan”.</p>
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
                          {plan.formSnapshot?.staffingRatio || "Ratio"} •{" "}
                          {plan.formSnapshot?.createdBy || "Created by"}
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
                Human Rights first: least restrictive supports, privacy,
                informed consent/guardian involvement when applicable, and clear
                justification for any restrictions.
              </li>
              <li>
                Have a BCBA/clinical lead review outputs before implementation
                and document supervision as needed.
              </li>
              <li>
                Document what you did, what the learner did, what data showed,
                and what you’ll adjust next time.
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
