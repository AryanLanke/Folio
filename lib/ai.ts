// Helpers shared by the AI features: reading the JSON a model replies with, and cleaning the
// fields a request hands to it. The transport itself lives in lib/server/ai.ts.

// Models sometimes wrap their JSON in a ```json code fence, and sometimes return prose instead
// of JSON at all; both are handled here so each caller only deals with a parsed object.
export function parseJsonReply(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string") return null;
  try {
    const data: unknown = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const MAX_KEYWORDS = 25;
const MAX_KEYWORD_LENGTH = 60;

// Job keywords, as the browser sends them: strings only, trimmed, short, and few enough that
// the prompt stays a reasonable size.
export function keywords(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((k): k is string => typeof k === "string" && k.trim() !== "")
        .map((k) => k.slice(0, MAX_KEYWORD_LENGTH))
        .slice(0, MAX_KEYWORDS)
    : [];
}

// A request field: a trimmed string, cut to the length the model is allowed to see.
export const textField = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
