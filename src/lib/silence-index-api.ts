const CHAT_URL =
  "https://agent-silence-index-7474646980615929.aws.databricksapps.com/chat";

export async function fetchSilenceIndexChat(userQuery: string): Promise<string | null> {
  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        messages: [{ role: "user", content: userQuery }],
      }),
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();
    const text = extractResponseText(data);
    return text?.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}

function extractResponseText(data: unknown): string | null {
  if (typeof data === "string") return data;

  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;

  if (typeof record.content === "string") return record.content;
  if (typeof record.message === "string") return record.message;
  if (typeof record.text === "string") return record.text;
  if (typeof record.response === "string") return record.response;

  const choice = record.choices;
  if (Array.isArray(choice) && choice[0] && typeof choice[0] === "object") {
    const msg = (choice[0] as Record<string, unknown>).message;
    if (msg && typeof msg === "object" && typeof (msg as Record<string, unknown>).content === "string") {
      return (msg as Record<string, unknown>).content as string;
    }
  }

  const messages = record.messages;
  if (Array.isArray(messages)) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m && typeof m === "object") {
        const role = (m as Record<string, unknown>).role;
        const content = (m as Record<string, unknown>).content;
        if (role === "assistant" && typeof content === "string") return content;
      }
    }
    const last = messages[messages.length - 1];
    if (last && typeof last === "object" && typeof (last as Record<string, unknown>).content === "string") {
      return (last as Record<string, unknown>).content as string;
    }
  }

  return null;
}
