import React, { useEffect, useMemo, useState } from "react";
import {
  addWorksheet,
  loadWorksheets,
  removeWorksheet,
} from "./utils/worksheetStorage.js";

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

function buildWorksheetItems(form) {
  const topic =
    form.topicCategory === "Custom (write below)"
      ? String(form.customTopic || "").trim()
      : form.topicCategory;

  const focus = String(form.lessonFocus || "").trim();
  const context = String(form.communityContext || "").trim();
  const goals = String(form.goals || "").trim();
  const materials = String(form.materials || "").trim();

  const base = focus || topic || "the target skill";

  const items = [
    `Define ${base} in your own words.`,
    `List 3 steps to complete ${base}.`,
    `Identify one safety risk related to ${base} and how to reduce it.`,
    `Scenario: ${context || "You are in the community"} — what is the best next step?`,
    `Write a short script for how you would communicate ${base} to a staff member.`,
    `Circle or mark: Which option shows healthy boundaries for ${base}? Explain.`,
    `Match: Pair each situation with the safest response.`,
    `Fill in the blank: When I need help with ${base}, I will _______________.`,
    `Checklist: What tools or supports make ${base} easier?`,
    `Reflection: How does ${base} help you at work or in the community?`,
  ];

  const answerKey = [
    `Definition should reference the core skill: ${base}.`,
    `Steps should be observable and in order (3+ steps).`,
    `Safety response should be specific and preventative.`,
    `Scenario response should show safe, adult-appropriate judgment.`,
    `Communication script uses clear, respectful language.`,
    `Boundary response respects consent, privacy, and dignity.`,
    `Matching pairs should show safe and effective responses.`,
    `Help-seeking statement should be direct and appropriate.`,
    `Checklist should reference supports/AAC/visuals or materials.`,
    `Reflection ties to real-life use (work/community/independence).`,
  ];

  return {
    topic,
    focus,
    goals,
    materials,
    items,
    answerKey,
  };
}

const DRAFT_KEY = "lessonlab_worksheet_draft_v1";

export default function WorksheetPage({ health }) {
  const [form, setForm] = useState(emptyWorksheet);
  const [answers, setAnswers] = useState(Array(10).fill(""));
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setSaved(loadWorksheets());
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form) setForm((prev) => ({ ...prev, ...parsed.form }));
      if (Array.isArray(parsed?.answers)) setAnswers(parsed.answers);
    } catch {}
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

  function saveCurrent() {
    const title = toTitleCase(form.lessonFocus || form.topicCategory);
    const item = {
      id: uid(),
      title,
      createdAt: new Date().toISOString(),
      formSnapshot: form,
      answers,
    };
    const items = addWorksheet(item);
    setSaved(items);
  }

  function reset() {
    setForm(emptyWorksheet);
    setAnswers(Array(10).fill(""));
  }

  const preview = useMemo(() => buildWorksheetItems(form), [form]);

  useEffect(() => {
    if (!Array.isArray(preview.items)) return;
    if (answers.length === preview.items.length) return;
    setAnswers((prev) => {
      const next = Array(preview.items.length).fill("");
      for (let i = 0; i < Math.min(prev.length, next.length); i += 1) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [preview.items, answers.length]);

  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form, answers }),
      );
    } catch {}
  }, [form, answers]);

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
          <button className="btn" onClick={saveCurrent}>
            Save progress
          </button>
          <button className="btn ghost" onClick={reset}>
            Reset
          </button>
        </div>

        <p className="hint">
          Tip: Include concrete accommodations and real-world context for the most
          usable worksheets.
        </p>
      </section>

      <section className="card worksheetOutput">
        <div className="outputHeader">
          <h2>Projector worksheet</h2>
          <div className="outputMeta">
            <span className="pill subtle">Model: {headerModel}</span>
            <span className="pill subtle">Saved: {saved.length}</span>
          </div>
        </div>

        <div className="worksheetDeck">
          <div className="worksheetSlide">
            <div className="worksheetTitle">
              {preview.topic || "Worksheet Topic"} — {preview.focus || "Lesson focus"}
            </div>
            <div className="worksheetMeta">
              <span>Goals: {preview.goals || "Define measurable outcomes."}</span>
              <span>Materials: {preview.materials || "List required supports."}</span>
            </div>

            <div className="worksheetItems">
              {preview.items.map((item, idx) => (
                <div key={item} className="worksheetItem">
                  <div className="worksheetPrompt">
                    {idx + 1}. {item}
                  </div>
                  <textarea
                    className="worksheetAnswer"
                    rows={2}
                    value={answers[idx] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[idx] = value;
                        return next;
                      });
                    }}
                    placeholder="Type response here..."
                  />
                </div>
              ))}
            </div>
          </div>

          {form.includeAnswerKey ? (
            <aside className="worksheetNotes">
              <h3>Answer key / facilitator notes</h3>
              <ul className="worksheetNotesList">
                {preview.answerKey.map((note, idx) => (
                  <li key={note}>
                    <strong>{idx + 1}.</strong> {note}
                  </li>
                ))}
              </ul>

              <div className="worksheetNotesMeta">
                <div>
                  <strong>Accommodations:</strong>{" "}
                  {form.accommodations || "Add AAC, visuals, reduced writing, or breaks."}
                </div>
                <div>
                  <strong>Safety focus:</strong>{" "}
                  {form.healthSafetyRisks || "Review relevant safety risks."}
                </div>
                <div>
                  <strong>Rights & consent:</strong>{" "}
                  {form.rightsConsiderations || "Protect dignity and consent."}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
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
                    <button
                      className="btn subtle"
                      onClick={() => {
                        setForm(item.formSnapshot || emptyWorksheet);
                        setAnswers(
                          Array.isArray(item.answers)
                            ? item.answers
                            : Array(10).fill(""),
                        );
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
