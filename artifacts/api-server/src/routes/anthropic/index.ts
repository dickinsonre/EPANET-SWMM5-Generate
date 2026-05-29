import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { SummarizeNetworkBody } from "@workspace/api-zod";

const router: IRouter = Router();

const MODEL = "claude-opus-4-7";
const MAX_TOKENS = 8192;

// Lightweight in-memory abuse control for this metered (paid) AI endpoint.
// This is not a substitute for auth, but it caps credit-burn from scripted
// abuse: per-client fixed window plus a global ceiling across all clients.
const RATE_WINDOW_MS = 60_000;
const PER_CLIENT_MAX = 10; // requests per window per IP
const GLOBAL_MAX = 60; // requests per window across all clients
const clientHits = new Map<string, { count: number; resetAt: number }>();
let globalWindow = { count: 0, resetAt: Date.now() + RATE_WINDOW_MS };

function rateLimitExceeded(ip: string): boolean {
  const now = Date.now();
  if (now >= globalWindow.resetAt) {
    globalWindow = { count: 0, resetAt: now + RATE_WINDOW_MS };
  }
  if (clientHits.size > 5000) {
    for (const [k, v] of clientHits) if (now >= v.resetAt) clientHits.delete(k);
  }
  const entry = clientHits.get(ip);
  if (!entry || now >= entry.resetAt) {
    clientHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > PER_CLIENT_MAX) return true;
  }
  globalWindow.count += 1;
  return globalWindow.count > GLOBAL_MAX;
}

const SYSTEM_PROMPT = [
  "You are a hydraulic-modeling assistant embedded in a tool that generates",
  "synthetic EPANET 2.x water-distribution and EPA SWMM 5.x stormwater network",
  "models. The user just generated a network and wants to understand what the",
  "program produced. You will receive a structured snapshot of that run (mode,",
  "units, configuration, statistics, and seed).",
  "",
  "Explain, in clear plain language for a civil/water engineer, what the program",
  "just did and what the resulting model contains. Cover: the network type and",
  "size, how it is laid out, the key hydraulic/hydrologic assumptions, and any",
  "notable figures in the stats. Be specific and quote the actual numbers from",
  "the snapshot. If a follow-up question is provided, answer it directly using",
  "only the snapshot; if the snapshot does not contain the answer, say so plainly.",
  "Do not invent values that are not present. Keep it concise: a short orienting",
  "sentence, then tight bullet points. Use Markdown.",
].join("\n");

router.post("/anthropic/summarize", async (req, res): Promise<void> => {
  if (rateLimitExceeded(req.ip ?? "unknown")) {
    req.log.warn({ ip: req.ip }, "Anthropic summarize rate limit exceeded");
    res.status(429).json({ error: "Too many requests — please wait a moment and try again." });
    return;
  }

  const parsed = SummarizeNetworkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { networkContext, question } = parsed.data;

  const userContent = question
    ? `Network snapshot:\n\n${networkContext}\n\nQuestion: ${question}`
    : `Network snapshot:\n\n${networkContext}\n\nSummarize what the program just did.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const summary = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    if (!summary) {
      req.log.error({ model: MODEL }, "Anthropic returned no text content");
      res.status(502).json({ error: "AI provider returned an empty response" });
      return;
    }

    res.json({ summary, model: MODEL });
  } catch (err) {
    req.log.error({ err }, "Anthropic summarize request failed");
    res.status(502).json({ error: "Failed to reach the AI provider" });
    return;
  }
});

export default router;
