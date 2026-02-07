import React, { useEffect, useMemo, useState } from "react";
import WorksheetPage from "./WorksheetPage.jsx";

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

export default function WorksheetApp() {
  const [health, setHealth] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [view, setView] = useState(getInitialView);

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
            <h1>LessonLab Worksheets</h1>
            <p>Printable adult-focused worksheet packs (local Ollama)</p>
          </div>
        </div>

        <div className="status">
          <button
            type="button"
            className="pill pillBtn"
            onClick={() => setView((v) => (v === "standard" ? "projector" : "standard"))}
            aria-label={`Switch to ${view === "standard" ? "projector" : "standard"} view`}
            title={`Switch to ${view === "standard" ? "projector" : "standard"} view`}
          >
            {view === "standard" ? "Projector view" : "Standard view"}
          </button>

          <button
            type="button"
            className="pill pillBtn"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Dark" : "Light"}
          </button>

          <a className="pill pillBtn" href="/" title="Back to lesson plans">
            Back to Lesson Plans
          </a>

          <div className={"pill " + (health?.ok ? "ok" : "bad")}>
            {connectionPill}
          </div>
          <div className="pill subtle">Model: {headerModel}</div>
        </div>
      </header>

      <WorksheetPage health={health} />

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
