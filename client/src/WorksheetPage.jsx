import React, { useEffect, useMemo, useState } from "react";
import { addWorksheet, loadWorksheets, removeWorksheet } from "./utils/worksheetStorage.js";
import { downloadLessonPDF } from "./utils/pdf.js";

const TOPIC_CATEGORIES = [
  "Math & Money Skills",
  "Social Skills & Relationships",
  "Boundaries & Consent",
  "Internet Safety & Digital Literacy",
  "Community Safety Skills",
  "General Safety Skills",
  "Communication & AAC",
  "ASL / Signing",
  "Hygiene & Grooming",
  "Health & Wellness",
  "Nutrition & Meal Planning",
  "Cooking & Kitchen Safety",
  "Coping Skills & Emotional Regulation",
  "Arts, Crafts & Creative Expression",
  "Community Mapping & Transportation",
  "Employment & Workplace Skills",
  "Leisure & Recreation",
  "Independent Living Skills",
  "Custom (write below)",
];

const WORKSHEET_FORMATS = [
  "Fill-in-the-blank",
  "Checklist / Self-Assessment",
  "Scenario responses",
  "Matching",
  "Sequencing / Steps",
  "Short answer",
  "Role-play prompts",
  "Decision tree",
];

const emptyWorksheet = {
  createdBy: "",
  staffingRatio: "",
  serviceType: "DDS + MassHealth aligned (braided services)",
  serviceDelivery: "Hybrid (center + community)",
  setting: "Adult Day Program (MA)",
  sessionLength: "30 minutes",
  learnerAge: "",
  learnerOverview: "",
  communicationMode: "",
  mobilityNeeds: "",
  sensoryProfile: "",
  engagementInterests: "",
  communityContext: "",
  topicCategory: TOPIC_CATEGORIES[0],
  customTopic: "",
  lessonFocus: "",
  goals: "",
  prerequisites: "",
  materials: "",
  worksheetFormats: ["Fill-in-the-blank", "Scenario responses", "Checklist / Self-Assessment"],
  difficulty: "Mixed (scaffolded: easy → advanced)",
  accommodations: "",
  healthSafetyRisks: "",
  rightsConsiderations: "",
  tone: "Professional, warm, adult",
  includeAnswerKey: true,
  includeYouTubeLinks: true,
  includeCommunityPractice: true,
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toTitleCase(s) {
  return String(s || "").trim() || "Worksheet Pack";
}

export default function WorksheetPage({ health }) {
  const [form, setForm] = useState(emptyWorksheet);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setSaved(loadWorksheets());
  }, []);

  const headerModel = useMemo(() => {
    if (!health?.ok) return "offline";
    return `${health.model}`;
  }, [health]);

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function toggleFormat(value) {
    setForm((prev) => {
      const arr = Array.isArray(prev.worksheetFormats) ? prev.worksheetFormats : [];
      const has = arr.includes(value);
      const next = has ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...prev, worksheetFormats: next };
    });
  }

  async function generateWorksheet() {
    setError("");
    setOutput("");
    setLoading(true);
    try {
      if (!String(form.createdBy || "").trim()) {
        throw new Error("Created By is required.");
      }
      if (!String(form.staffingRatio || "").trim()) {
        throw new Error("Staffing Ratio is required.");
      }
      if (!String(form.lessonFocus || "").trim()) {
        throw new Error("Lesson Focus is required.");
      }
      const topicCategory =
        form.topicCategory === "Custom (write below)"
          ? String(form.customTopic || "").trim()
          : form.topicCategory;
      if (!String(topicCategory || "").trim()) {
        throw new Error("Topic Category is required.");
      }

      const payload = {
        ...form,
        topicCategory,
      };

      const res = await fetch("/api/worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Worksheet generation failed.");
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
    const title = toTitleCase(form.lessonFocus);
    const item = {
      id: uid(),
      title,
      createdAt: new Date().toISOString(),
      formSnapshot: form,
      text: output,
    };
    const items = addWorksheet(item);
    setSaved(items);
  }

  function exportPDF(item) {
    const f = item?.formSnapshot || form;
    const topicCategory =
      f.topicCategory === "Custom (write below)"
        ? f.customTopic || "Custom topic"
        : f.topicCategory;

    const metaLines = [
      `Created: ${new Date(item?.createdAt || Date.now()).toLocaleString()}`,
      `Created by: ${f.createdBy || "N/A"}  |  Staffing ratio (staff:clients): ${
        f.staffingRatio || "N/A"
      }`,
      `Service: ${f.serviceType || "N/A"}  |  Delivery: ${f.serviceDelivery || "N/A"}`,
      `Model: ${health?.model || "unknown"}  |  Server: ${health?.ollamaUrl || "unknown"}`,
      `Setting: ${f.setting || "N/A"}  |  Session length: ${f.sessionLength || "N/A"}`,
      `Learner age: ${f.learnerAge || "N/A"}  |  Topic: ${topicCategory || "N/A"}`,
      `Lesson focus: ${f.lessonFocus || "N/A"}`,
      `Goals: ${f.goals || "N/A"}`,
      `Accommodations: ${f.accommodations || "N/A"}`,
    ];

    downloadLessonPDF({
      title: item?.title || toTitleCase(f.lessonFocus),
      metaLines,
      bodyText: item?.text || output,
    });
  }

  function reset() {
    setForm(emptyWorksheet);
    setOutput("");
    setError("");
  }

  return (
    <main className="worksheetPage">
      <section className="card worksheetCard">
        <h2>Worksheet builder</h2>

        <div className="formGrid">
          <label className="field">
            <span className="req">Created by (required)</span>
            <input
              value={form.createdBy}
              onChange={(e) => update("createdBy", e.target.value)}
              placeholder="e.g., J. Doe, BCBA / Clinical Lead"
            />
          </label>

          <label className="field">
            <span className="req">Staffing ratio (required)</span>
            <input
              value={form.staffingRatio}
              onChange={(e) => update("staffingRatio", e.target.value)}
              placeholder="e.g., 1:3 (staff:clients) or 1:1"
            />
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
              <option>Employment-focused (supported employment / job coaching)</option>
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
              rows={2}
              placeholder="Strengths, supports, baseline notes, learning style."
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
              placeholder="e.g., ambulatory; walker; wheelchair; transfers"
            />
          </label>

          <label className="field wide">
            <span>Sensory profile / regulation needs</span>
            <textarea
              value={form.sensoryProfile}
              onChange={(e) => update("sensoryProfile", e.target.value)}
              rows={2}
              placeholder="Sensory supports, triggers, break needs."
            />
          </label>

          <label className="field wide">
            <span>Engagement interests / fun hooks</span>
            <textarea
              value={form.engagementInterests}
              onChange={(e) => update("engagementInterests", e.target.value)}
              rows={2}
              placeholder="Interests, hobbies, routines, or themes."
            />
          </label>

          <label className="field wide">
            <span>Community context / location focus</span>
            <textarea
              value={form.communityContext}
              onChange={(e) => update("communityContext", e.target.value)}
              rows={2}
              placeholder="Neighborhoods, job sites, transit, or community goals."
            />
          </label>

          <label className="field">
            <span className="req">Topic category</span>
            <select
              value={form.topicCategory}
              onChange={(e) => update("topicCategory", e.target.value)}
            >
              {TOPIC_CATEGORIES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          {form.topicCategory === "Custom (write below)" ? (
            <label className="field">
              <span className="req">Custom topic</span>
              <input
                value={form.customTopic}
                onChange={(e) => update("customTopic", e.target.value)}
                placeholder="e.g., Community safety: reporting an incident"
              />
            </label>
          ) : null}

          <label className="field wide">
            <span className="req">Lesson focus (required)</span>
            <textarea
              value={form.lessonFocus}
              onChange={(e) => update("lessonFocus", e.target.value)}
              rows={2}
              placeholder="Specific skill focus (what this worksheet teaches)."
            />
          </label>

          <label className="field wide">
            <span>Goals / outcomes</span>
            <textarea
              value={form.goals}
              onChange={(e) => update("goals", e.target.value)}
              rows={2}
              placeholder="Measurable outcomes or criteria for mastery."
            />
          </label>

          <label className="field">
            <span>Prerequisites / baseline</span>
            <textarea
              value={form.prerequisites}
              onChange={(e) => update("prerequisites", e.target.value)}
              rows={2}
              placeholder="Baseline skills and prompt level."
            />
          </label>

          <label className="field">
            <span>Materials</span>
            <textarea
              value={form.materials}
              onChange={(e) => update("materials", e.target.value)}
              rows={2}
              placeholder="Real-world materials, visuals, adaptive tools."
            />
          </label>

          <label className="field">
            <span>Difficulty level</span>
            <input
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value)}
            />
          </label>

          <label className="field wide">
            <span>Accommodations & accessibility</span>
            <textarea
              value={form.accommodations}
              onChange={(e) => update("accommodations", e.target.value)}
              rows={2}
              placeholder="AAC supports, visuals, reduced writing, sensory supports."
            />
          </label>

          <label className="field wide">
            <span>Health & safety risks</span>
            <textarea
              value={form.healthSafetyRisks}
              onChange={(e) => update("healthSafetyRisks", e.target.value)}
              rows={2}
              placeholder="Seizures, choking, elopement, allergies, etc."
            />
          </label>

          <label className="field wide">
            <span>Human rights / consent considerations</span>
            <textarea
              value={form.rightsConsiderations}
              onChange={(e) => update("rightsConsiderations", e.target.value)}
              rows={2}
              placeholder="Dignity, privacy, guardianship, consent."
            />
          </label>

          <label className="field">
            <span>Desired tone</span>
            <input
              value={form.tone}
              onChange={(e) => update("tone", e.target.value)}
            />
          </label>
        </div>

        <div className="worksheetOptions">
          <div className="blockTitle">Worksheet formats</div>
          <div className="checks">
            {WORKSHEET_FORMATS.map((f) => (
              <label key={f} className="checkItem">
                <input
                  type="checkbox"
                  checked={(form.worksheetFormats || []).includes(f)}
                  onChange={() => toggleFormat(f)}
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="worksheetToggles">
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.includeAnswerKey}
              onChange={(e) => update("includeAnswerKey", e.target.checked)}
            />
            <span>Include Answer Key</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.includeYouTubeLinks}
              onChange={(e) => update("includeYouTubeLinks", e.target.checked)}
            />
            <span>Include YouTube search links</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.includeCommunityPractice}
              onChange={(e) => update("includeCommunityPractice", e.target.checked)}
            />
            <span>Include community practice ideas</span>
          </label>
        </div>

        <div className="actions">
          <button className="btn" disabled={loading} onClick={generateWorksheet}>
            {loading ? "Generatingâ€¦" : "Generate worksheets"}
          </button>
          <button className="btn ghost" disabled={loading} onClick={reset}>
            Reset
          </button>
        </div>

        <p className="hint">
          Tip: Include concrete accommodations and real-world context for the most
          usable worksheets.
        </p>
      </section>

      <section className="card outputCard worksheetOutput">
        <div className="outputHeader">
          <h2>Worksheet output</h2>
          <div className="outputActions">
            <button className="btn subtle" disabled={!output} onClick={saveCurrent}>
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

        <div className="outputMeta">
          <span className="pill subtle">Model: {headerModel}</span>
          <span className="pill subtle">
            Saved: {saved.length}
          </span>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {!output ? (
          <div className="empty">
            <div className="emptyInner">
              <div className="spark" aria-hidden="true" />
              <p>Fill required fields and click â€œGenerate worksheetsâ€.</p>
              <p className="small">
                The worksheet pack is designed for adult day programs in MA.
              </p>
            </div>
          </div>
        ) : (
          <pre className="output">{output}</pre>
        )}
      </section>

      <section className="card worksheetLibrary">
        <h2>Saved worksheet packs</h2>
        {saved.length === 0 ? (
          <p className="hint">No saved worksheets yet. Generate one and click Save.</p>
        ) : (
          <div className="list">
            {saved.map((item) => (
              <div key={item.id} className="item">
                <div className="itemTop">
                  <div>
                    <div className="itemTitle">{item.title}</div>
                    <div className="itemMeta">
                      {new Date(item.createdAt).toLocaleString()} â€¢{" "}
                      {item.formSnapshot?.topicCategory || "Topic"} â€¢{" "}
                      {item.formSnapshot?.staffingRatio || "Ratio"} â€¢{" "}
                      {item.formSnapshot?.createdBy || "Created by"}
                    </div>
                  </div>
                  <div className="itemBtns">
                    <button className="btn subtle" onClick={() => exportPDF(item)}>
                      PDF
                    </button>
                    <button
                      className="btn subtle"
                      onClick={() => {
                        setForm(item.formSnapshot || emptyWorksheet);
                        setOutput(item.text || "");
                      }}
                    >
                      Open
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => {
                        const next = removeWorksheet(item.id);
                        setSaved(next);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="itemPreview">
                  {String(item.text || "").slice(0, 220)}
                  {String(item.text || "").length > 220 ? "â€¦" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
