export async function ollamaGenerate({ ollamaUrl, model, prompt }) {
  const url = new URL("/api/generate", ollamaUrl).toString();

  // Ollama request non-streaming -- reminder: change later
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${txt || res.statusText}`);
  }

  const data = await res.json();

  // Typical response shape includes { response: "..." }
  const text = (data && (data.response || data.message || data.output)) ?? "";
  return String(text);
}
