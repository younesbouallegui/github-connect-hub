// SSE streaming helper for the ask-stream edge function.
// Streams tokens from Lovable AI Gateway via the Supabase edge proxy.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export interface AiStreamInput {
  mode: "explain" | "chat" | "remediate";
  incident?: Record<string, unknown>;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError?: (err: { status: number; message: string }) => void;
}

export async function streamIncidentAi(opts: AiStreamInput) {
  const { signal, onDelta, onDone, onError, mode, incident, messages } = opts;

  // Derive the question (last user message) and the rest of the history.
  const history = (messages ?? []).filter((m) => m.role !== "system");
  let question = "";
  let trimmedHistory = history;

  if (history.length > 0 && history[history.length - 1].role === "user") {
    question = history[history.length - 1].content;
    trimmedHistory = history.slice(0, -1);
  } else if (mode === "explain" && incident) {
    question = `Please analyze this incident and explain the root cause, blast radius, and recommended remediation steps.`;
  } else if (mode === "remediate" && incident) {
    question = `Generate a step-by-step remediation plan for this incident.`;
  } else {
    question = "Investigate the current situation.";
  }

  const context = { mode, ...(incident ?? {}) };

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/ask-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history: trimmedHistory, context }),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    onError?.({ status: 0, message: e instanceof Error ? e.message : "Network error" });
    return;
  }

  if (!response.ok || !response.body) {
    let msg = `Request failed (${response.status})`;
    try {
      const j = await response.json();
      if (j?.error) msg = j.error;
    } catch { /* noop */ }
    onError?.({ status: response.status, message: msg });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split on SSE event boundary (blank line).
      let sepIdx: number;
      while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);

        for (const rawLine of rawEvent.split("\n")) {
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          if (json === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed?.choices?.[0]?.delta?.content as string | undefined;
            if (delta) onDelta(delta);
          } catch {
            // ignore non-JSON
          }
        }
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    onError?.({ status: 0, message: e instanceof Error ? e.message : "Stream error" });
    return;
  }

  onDone();
}
