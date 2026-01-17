# ABA LessonLab (Local Ollama)

A local-only lesson plan generator for ABA-based adult curriculum work.

- **Frontend:** Vite + React (JS/CSS)
- **Backend:** Node + Express
- **LLM:** Ollama running on your PC (localhost)

## Folder layout

- `server/` — Express API that calls Ollama
- `client/` — Vite/React UI

## What this app does

1. You enter lesson plan inputs (target skill, mastery criteria, data collection, supports, etc.)
2. The server calls your local Ollama model
3. The UI shows a full structured lesson plan
4. You can **save** plans locally and **export to PDF** (jsPDF)

## Quick start (after installing Ollama)

### 1) Ensure Ollama is running (Windows)

Most Windows installs run Ollama automatically in the background.

Quick check:

- `ollama --version`
- `ollama list`

If Ollama is NOT running, start it:

- `ollama serve`
  (Leave that terminal open.)

### 2) Pull a model (one-time per model)

You only need to pull a model once:

- `ollama pull qwen2.5:14b`

After it finishes downloading, you do NOT need to pull it again unless you delete models or choose a new model.

### 3) Start the server

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

### 4) Start the client

```bash
cd client
npm install
npm run dev
```

Open: http://127.0.0.1:5173

## Running the app (after cloning)

### Prereqs

- Node.js (LTS)
- Ollama installed

### One-time setup

1. Install dependencies:

   - `npm --prefix server install`
   - `npm --prefix client install`

2. Create server env file:

   - `cd server`
   - `copy .env.example .env`
   - (Optional) edit `.env` to change model name

3. Download your model (one-time):
   - `ollama pull qwen2.5:14b`

### Run (each time you want to use it)

1. Make sure Ollama is running:

   - `ollama list`
   - If not running: `ollama serve`

2. Start backend:

   - `cd server`
   - `npm run dev`

3. Start frontend (new terminal):
   - `cd client`
   - `npm run dev`

Open: http://127.0.0.1:5173

## Note:

- If you change models, update `server/.env` (OLLAMA_MODEL=...)
- Everything runs locally; no prompts or outputs are sent to a cloud service.

# Legal Notice, Copyright & Attribution

## Copyright Notice

© 2026 JMC Resources. All rights reserved.

This project, **ABA LessonLab (Local Ollama)**, including but not limited to its source code, application logic, user interface design, prompts, documentation, workflows, configuration, and overall structure, is an original copyrighted work authored by **JMC Resources**.

This work is protected under:

- United States Copyright Law (Title 17, U.S. Code)
- Applicable state and local laws
- International copyright treaties, including the Berne Convention

---

## License Status

**This project is NOT open source.**

No license is granted to use, copy, modify, redistribute, sublicense, publish, deploy, or create derivative works from this project, in whole or in part, **without prior written permission from the copyright holder**.

All rights not expressly granted are reserved.

---

## Prohibited Uses

Without explicit prior written authorization, you may **NOT**:

- Copy or reuse the source code, prompts, or application logic
- Modify, adapt, or extend the project in any form
- Deploy the project publicly or privately (including internal organizational use)
- Rebrand, resell, or redistribute the project
- Use this project as a template, reference implementation, or foundation for another product
- Incorporate any portion of this project into commercial or non-commercial software, curricula, tools, or services

Unauthorized modification and deployment are strictly prohibited.

---

## Permission & Authorized Use

Any party wishing to:

- Use this project
- Modify or extend it
- Deploy it in a clinical, educational, organizational, or commercial environment

**Must obtain prior written permission** from the copyright holder.

Permission requests must be made directly to the author and must clearly describe the intended use.

No permissions are granted by default.

---

## Attribution Requirements

If written permission is granted for authorized use, **clear and explicit attribution is required**.

Attribution must include, at minimum:

- Author name: **JMC Resources**
- Project name: **ABA LessonLab**
- A statement acknowledging original authorship

Attribution must be visible and included in documentation and/or the user interface as specified by the copyright holder.

---

## No Implied License

Nothing in this repository shall be interpreted as granting any license, express or implied, including but not limited to implied licenses for:

- Commercial use
- Derivative works
- Distribution or sublicensing

Use of this repository without permission constitutes unauthorized use.

---

## Disclaimer of Affiliation

This project is an independent work and is **not affiliated with, endorsed by, or sponsored by**:

- Any state agency
- Any federal agency
- Any licensing or regulatory board
- Any clinical, educational, or governmental organization
- Ollama or any AI model providers beyond local runtime usage

---

## Enforcement

Unauthorized use, copying, modification, or deployment of this project may result in legal action under applicable civil and criminal laws.

The copyright holder reserves the right to pursue all remedies available under law.

---

## Governing Law

This project and all related legal matters shall be governed by and construed in accordance with the laws of the United States and the applicable laws of the author’s state of residence, without regard to conflict-of-law principles.

---

## Contact

For permission requests or legal inquiries, please contact the copyright holder directly.
