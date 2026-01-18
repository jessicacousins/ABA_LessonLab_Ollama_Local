// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { buildLessonPrompt } from "./prompt.js";
// import { ollamaGenerate } from "./ollama.js";
// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "2mb" }));
// const PORT = process.env.PORT || 3005;
// const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
// const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:14b";
// const ASSISTANT_NAME = process.env.ASSISTANT_NAME || "LessonLab";
// app.get("/api/health", (req, res) => {
//   res.json({
//     ok: true,
//     serverTime: new Date().toISOString(),
//     ollamaUrl: OLLAMA_URL,
//     model: OLLAMA_MODEL,
//     assistantName: ASSISTANT_NAME,
//   });
// });
// app.post("/api/generate", async (req, res) => {
//   try {
//     const input = req.body || {};
//     const prompt = buildLessonPrompt(input, ASSISTANT_NAME);
//     const text = await ollamaGenerate({
//       ollamaUrl: OLLAMA_URL,
//       model: process.env.OLLAMA_MODEL || OLLAMA_MODEL,
//       prompt,
//     });
//     const cleaned = text
//       .replace(/^\s*```(markdown)?/i, "")
//       .replace(/```\s*$/i, "")
//       .trim();
//     res.json({
//       ok: true,
//       text: cleaned,
//     });
//   } catch (err) {
//     res.status(500).json({ ok: false, error: err?.message || String(err) });
//   }
// });
// app.listen(PORT, () => {
//   console.log(`[LessonLab] Server running on http://127.0.0.1:${PORT}`);
//   console.log(`[LessonLab] Using Ollama at ${OLLAMA_URL} with model
// ${OLLAMA_MODEL}`);
// });
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { buildLessonPrompt } from "./prompt.js";
import { ollamaGenerate } from "./ollama.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3005;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:14b";
const ASSISTANT_NAME = process.env.ASSISTANT_NAME || "LessonLab";

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    serverTime: new Date().toISOString(),
    ollamaUrl: OLLAMA_URL,
    model: OLLAMA_MODEL,
    assistantName: ASSISTANT_NAME,
  });
});

function missingRequiredFields(input) {
  const missing = [];
  if (!String(input?.createdBy || "").trim()) missing.push("createdBy");
  if (!String(input?.staffingRatio || "").trim()) missing.push("staffingRatio");
  if (!String(input?.targetSkill || "").trim()) missing.push("targetSkill");
  return missing;
}

app.post("/api/generate", async (req, res) => {
  try {
    const input = req.body || {};
    const missing = missingRequiredFields(input);
    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: `Missing required field(s): ${missing.join(", ")}`,
      });
    }

    const prompt = buildLessonPrompt(input, ASSISTANT_NAME);

    const text = await ollamaGenerate({
      ollamaUrl: OLLAMA_URL,
      model: process.env.OLLAMA_MODEL || OLLAMA_MODEL,
      prompt,
    });

    const cleaned = String(text || "")
      .replace(/^\s*```(markdown)?/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    res.json({ ok: true, text: cleaned });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[LessonLab] Server running on http://127.0.0.1:${PORT}`);
  console.log(
    `[LessonLab] Using Ollama at ${OLLAMA_URL} with model ${OLLAMA_MODEL}`,
  );
});
