# ABA LessonLab (Local Ollama) — Windows 11

A local-only lesson plan generator for ABA-based adult curriculum work.
- **Frontend:** Vite + React (JS/CSS)
- **Backend:** Node + Express
- **LLM:** Ollama running on your PC (localhost)

## Folder layout
- `server/` — Express API that calls Ollama
- `client/` — Vite/React UI

## What this app does
1) You enter lesson plan inputs (target skill, mastery criteria, data collection, supports, etc.)
2) The server calls your local Ollama model
3) The UI shows a full structured lesson plan
4) You can **save** plans locally and **export to PDF** (jsPDF)

## Quick start (after installing Ollama)
### 1) Start Ollama
- Open **PowerShell** and run:
  - `ollama serve`

### 2) Pull a model (recommended)
- `ollama pull qwen2.5:14b`
- (Alternative) `ollama pull qwen3:14b`

### 3) Start the server
```bash
cd server
copy .env.example .env
npm install
npm run dev
```

### 4) Start the client
```bash
cd ../client
npm install
npm run dev
```

Open: http://127.0.0.1:5173

## Notes
- If you change models, update `server/.env` (OLLAMA_MODEL=...)
- Everything runs locally; no prompts or outputs are sent to a cloud service.
