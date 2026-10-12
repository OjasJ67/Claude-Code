/* ==========================================================================
   Agar & Oak: AI chat endpoint (Netlify Function, served at /api/chat)
   Needs one environment variable in Netlify: ANTHROPIC_API_KEY.
   The briefing comes from the same files the website uses, so prices, flags
   and FAQ answers never drift apart.
   ========================================================================== */
import Anthropic from "@anthropic-ai/sdk";
import configFile from "../../assets/js/config.js";
import productsFile from "../../assets/js/products.js";
import assistantFile from "../../assets/js/assistant.js";
import differencesFile from "../../assets/js/differences.js";
import promptFile from "../../assets/js/assistant-prompt.js";

const { EMAIL, PHONE_DISPLAY, FLAGS, SURVIVAL_RATE } = configFile;
const { PRODUCTS } = productsFile;
const { ASSISTANT } = assistantFile;
const { DIFFERENCES } = differencesFile;
const { ASSISTANT_PROMPT } = promptFile;

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 10;          // most recent messages kept from the conversation
const MAX_USER_CHARS = 600;    // longest visitor message accepted
const MAX_REPLY_CHARS = 2000;  // longest earlier assistant reply passed back

const SYSTEM_PROMPT = ASSISTANT_PROMPT.build(ASSISTANT, {
  products: PRODUCTS,
  flags: FLAGS,
  email: EMAIL,
  phoneDisplay: PHONE_DISPLAY,
  differences: DIFFERENCES,
  survivalRate: SURVIVAL_RATE
});

let client; // created on first use; reads ANTHROPIC_API_KEY
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

// Keep only well-formed, short, alternating turns that start and end with the visitor.
function cleanTurns(input) {
  if (!Array.isArray(input)) return null;
  const turns = input
    .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
    .map((t) => ({
      role: t.role,
      content: t.content.trim().slice(0, t.role === "user" ? MAX_USER_CHARS : MAX_REPLY_CHARS)
    }))
    .filter((t) => t.content)
    .slice(-MAX_TURNS);
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 503);

  // Only answer requests from this site's own pages.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: "forbidden" }, 403);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const messages = cleanTurns(body && body.messages);
  if (!messages) return json({ error: "bad_request" }, 400);

  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages
    });

    if (response.stop_reason === "refusal") {
      return json({ reply: "I can't help with that one. For anything about our plants or cleanup crews, email " + EMAIL + " and we'll reply personally." });
    }

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();
    if (!reply) return json({ error: "empty_reply" }, 502);
    return json({ reply });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key was rejected; check ANTHROPIC_API_KEY.");
      return json({ error: "not_configured" }, 503);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json({ error: "busy" }, 429);
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error("Bad request to the Anthropic API:", error.message);
      return json({ error: "bad_request" }, 400);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      return json({ error: "upstream_error" }, 502);
    }
    console.error(error);
    return json({ error: "server_error" }, 500);
  }
};

export const config = { path: "/api/chat" };
