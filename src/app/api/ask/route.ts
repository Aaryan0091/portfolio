import { systemPrompt } from "./profile";

/**
 * Ask AI: answers visitors' questions about Aaryan with an LLM, grounded in
 * the profile in ./profile.ts.
 *
 * Setup (see .env.example) — set ONE of:
 *   GROQ_API_KEY — from console.groq.com (free tier). Used first if set.
 *     GROQ_MODEL optionally overrides the model.
 *   ANTHROPIC_API_KEY — from console.anthropic.com (Claude).
 * Any other OpenAI-compatible provider (e.g. OpenRouter) works too: set
 * GROQ_API_KEY to its key, AI_BASE_URL to its API base URL and GROQ_MODEL
 * to one of its model names.
 *
 * With no key this returns 503 and the page falls back to its built-in
 * canned answers.
 *
 * Guards against abuse running up the bill: a per-visitor rate limit, a cap
 * on how much conversation is sent, and a short max answer length.
 */

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
// Llama 3.3 has been retired on Groq; GPT-OSS 120B is the strongest
// general model offered there now.
const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_ANSWER_TOKENS = 400;

/** Conversation sent per request: the latest turns only, each trimmed. */
const MAX_TURNS = 10;
const MAX_CHARS_PER_TURN = 1000;

/** Per-visitor limit. In memory, so best-effort on serverless (each warm
 * instance keeps its own count) — enough to stop casual hammering. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(visitor: string) {
  const now = Date.now();
  const recent = (hits.get(visitor) ?? []).filter(
    (time) => now - time < RATE_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT) {
    hits.set(visitor, recent);
    return true;
  }
  recent.push(now);
  hits.set(visitor, recent);
  // Keep the map from growing forever.
  if (hits.size > 5000) hits.clear();
  return false;
}

type Turn = { role: "user" | "assistant"; text: string };

/** Sends the conversation to Groq (or any OpenAI-compatible API). */
async function askOpenAiCompatible(apiKey: string, turns: Turn[]) {
  const baseUrl = (process.env.AI_BASE_URL || GROQ_BASE_URL).replace(/\/$/, "");
  const model = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;
  // GPT-OSS models think before answering, and that thinking counts toward
  // the token limit: keep it brief and leave room for the answer itself.
  const reasoning = model.includes("gpt-oss")
    ? { reasoning_effort: "low", include_reasoning: false }
    : {};
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      ...reasoning,
      max_tokens: model.includes("gpt-oss")
        ? MAX_ANSWER_TOKENS * 2
        : MAX_ANSWER_TOKENS,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        ...turns.map((turn) => ({ role: turn.role, content: turn.text })),
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

/** Sends the conversation to Claude. */
async function askClaude(apiKey: string, turns: Turn[]) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: MAX_ANSWER_TOKENS,
      system: systemPrompt,
      messages: turns.map((turn) => ({ role: turn.role, content: turn.text })),
    }),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return (
    (data.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim() || null
  );
}

export async function POST(request: Request) {
  const groqKey = process.env.GROQ_API_KEY;
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  if (!groqKey && !claudeKey) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  const visitor =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (rateLimited(visitor)) {
    return Response.json(
      {
        error:
          "You've asked a lot of questions in a short time — please try again in a few minutes.",
      },
      { status: 429 }
    );
  }

  let turns: Turn[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages)) throw new Error();
    turns = body.messages
      .filter(
        (turn): turn is Turn =>
          typeof turn === "object" &&
          turn !== null &&
          ((turn as Turn).role === "user" || (turn as Turn).role === "assistant") &&
          typeof (turn as Turn).text === "string"
      )
      .slice(-MAX_TURNS)
      .map((turn) => ({
        role: turn.role,
        text: turn.text.trim().slice(0, MAX_CHARS_PER_TURN),
      }))
      .filter((turn) => turn.text);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // The API needs the conversation to start with the visitor and end with
  // their latest question.
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const answer = groqKey
    ? await askOpenAiCompatible(groqKey, turns)
    : await askClaude(claudeKey!, turns);

  // Provider busy (e.g. Groq's free-tier per-minute limit) or down: report
  // "unavailable" so the page answers from its built-in canned replies
  // instead of showing an error.
  if (answer === null) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  return Response.json({
    answer: answer || "Sorry — I couldn't come up with an answer to that.",
  });
}
