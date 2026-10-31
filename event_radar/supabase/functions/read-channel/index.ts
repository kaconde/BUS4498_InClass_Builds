import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SOURCE = "groupme";
const GROUPME_API = "https://api.groupme.com/v3";

type GroupMeMessage = {
  id?: string;
  text?: string;
  created_at?: number | string;
  sender_id?: string;
  name?: string;
  sender_type?: string;
  system?: boolean;
};

type Cursor = {
  last_id: string;
  read_count: number;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getServiceRoleKey(): string {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, unknown>;
      if (typeof parsed.default === "string" && parsed.default.trim()) return parsed.default.trim();
    } catch (error) {
      console.warn("Could not parse SUPABASE_SECRET_KEYS", error);
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function secretValue(name: string): string {
  return (Deno.env.get(name) ?? "").trim();
}

function config(): { token: string; groupId: string; botId: string; supabaseUrl: string; serviceRoleKey: string } {
  return {
    token: secretValue("GROUPME_TOKEN"),
    groupId: secretValue("GROUPME_GROUP_ID"),
    botId: secretValue("GROUPME_BOT_ID"),
    supabaseUrl: secretValue("SUPABASE_URL"),
    serviceRoleKey: getServiceRoleKey(),
  };
}

function messageTime(message: GroupMeMessage): number {
  const value = typeof message.created_at === "number"
    ? message.created_at
    : Number(message.created_at ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function messageId(message: GroupMeMessage): string {
  return typeof message.id === "string" ? message.id : "";
}

function messageText(message: GroupMeMessage): string {
  return typeof message.text === "string" ? message.text.trim() : "";
}

function senderKey(message: GroupMeMessage): string {
  if (typeof message.sender_id === "string" && message.sender_id) return message.sender_id;
  return typeof message.name === "string" ? message.name : "";
}

function shouldSkip(message: GroupMeMessage): boolean {
  return message.sender_type === "bot"
    || message.sender_type === "system"
    || message.system === true
    || !messageText(message)
    || !messageId(message);
}

function ordered(messages: GroupMeMessage[]): GroupMeMessage[] {
  return [...messages].sort((left, right) => {
    const timeDifference = messageTime(left) - messageTime(right);
    if (timeDifference !== 0) return timeDifference;
    return messageId(left).localeCompare(messageId(right));
  });
}

async function groupmeRequest(path: string): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const { token } = config();
  const response = await fetch(`${GROUPME_API}${path}`, {
    headers: { "X-Access-Token": token },
  });
  if (response.status === 304) return { status: response.status, body: null };
  const text = await response.text();
  let body: Record<string, unknown> | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = null;
    }
  }
  if (!response.ok) throw new Error(`GroupMe request failed with status ${response.status}.`);
  return { status: response.status, body };
}

function responseMessages(body: Record<string, unknown> | null): GroupMeMessage[] {
  const response = body?.response;
  if (!response || typeof response !== "object") return [];
  const messages = (response as Record<string, unknown>).messages;
  return Array.isArray(messages)
    ? messages.filter((message): message is GroupMeMessage => Boolean(message && typeof message === "object"))
    : [];
}

function responseGroupName(body: Record<string, unknown> | null): string {
  const response = body?.response;
  if (!response || typeof response !== "object") return "";
  const responseObject = response as Record<string, unknown>;
  const group = responseObject.group && typeof responseObject.group === "object"
    ? responseObject.group
    : responseObject;
  if (!group || typeof group !== "object") return "";
  const name = (group as Record<string, unknown>).name;
  return typeof name === "string" ? name.trim() : "";
}

async function readGroupMessages(afterId = "", beforeId = ""): Promise<{ messages: GroupMeMessage[]; groupName: string }> {
  const { groupId } = config();
  const params = new URLSearchParams({ limit: "20" });
  if (afterId) params.set("after_id", afterId);
  if (beforeId) params.set("before_id", beforeId);
  const result = await groupmeRequest(`/groups/${encodeURIComponent(groupId)}/messages?${params.toString()}`);
  return { messages: responseMessages(result.body), groupName: responseGroupName(result.body) };
}

async function readGroupName(): Promise<string> {
  const { groupId } = config();
  const result = await groupmeRequest(`/groups/${encodeURIComponent(groupId)}`);
  return responseGroupName(result.body);
}

async function getCursor(admin: ReturnType<typeof createClient>): Promise<Cursor> {
  const { data, error } = await admin
    .from("channel_cursor")
    .select("last_id, read_count")
    .eq("source", SOURCE)
    .maybeSingle();
  if (error) throw new Error(`Could not read the chat cursor: ${error.message}`);
  return {
    last_id: typeof data?.last_id === "string" ? data.last_id : "",
    read_count: typeof data?.read_count === "number" ? data.read_count : 0,
  };
}

async function saveCursor(admin: ReturnType<typeof createClient>, lastId: string, readCount: number): Promise<void> {
  const { error } = await admin.from("channel_cursor").upsert({
    source: SOURCE,
    last_id: lastId,
    read_count: readCount,
    updated_at: new Date().toISOString(),
  }, { onConflict: "source" });
  if (error) throw new Error(`Could not save the chat cursor: ${error.message}`);
}

async function threadFor(message: GroupMeMessage): Promise<string[]> {
  const currentSender = senderKey(message);
  const currentTime = messageTime(message);
  if (!currentSender || !currentTime || !messageId(message)) return [];
  try {
    const result = await readGroupMessages("", messageId(message));
    return ordered(result.messages)
      .filter((earlier) => !shouldSkip(earlier))
      .filter((earlier) => senderKey(earlier) === currentSender)
      .filter((earlier) => {
        const time = messageTime(earlier);
        return time < currentTime && time >= currentTime - 10 * 60;
      })
      .slice(-4)
      .map(messageText);
  } catch (error) {
    console.warn("Could not read earlier GroupMe messages", error);
    return [];
  }
}

async function sendToAgent(
  message: GroupMeMessage,
  sourceName: string,
  thread: string[],
): Promise<Record<string, unknown>> {
  const { supabaseUrl } = config();
  const response = await fetch(`${supabaseUrl}/functions/v1/submit-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      announcement: messageText(message),
      source: SOURCE,
      source_id: messageId(message),
      source_name: sourceName || "GroupMe",
      thread,
    }),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(`The event agent returned status ${response.status}.`);
  return body;
}

async function postDecision(text: string): Promise<void> {
  const { botId } = config();
  if (!botId) return;
  const response = await fetch(`${GROUPME_API}/bots/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, text: text.slice(0, 1000) }),
  });
  if (!response.ok) throw new Error(`GroupMe bot reply failed with status ${response.status}.`);
}

function decisionText(decision: Record<string, unknown>): string {
  const message = typeof decision.message === "string" ? decision.message.trim() : "The post was reviewed.";
  const reasons = Array.isArray(decision.reasons)
    ? decision.reasons.filter((reason): reason is string => typeof reason === "string" && reason.trim()).join(" ")
    : "";
  return `Club Event Radar: ${message}${reasons ? ` ${reasons}` : ""}`;
}

async function checkGroupMe(): Promise<Response> {
  const { token, groupId, botId } = config();
  if (!token || !groupId) {
    return jsonResponse({
      ok: true,
      check: SOURCE,
      ready: false,
      token_configured: Boolean(token),
      group_configured: Boolean(groupId),
      group_reachable: false,
      bot_configured: Boolean(botId),
      message: "GroupMe settings are incomplete.",
    });
  }
  try {
    const result = await groupmeRequest(`/groups/${encodeURIComponent(groupId)}`);
    const reachable = result.status >= 200 && result.status < 300;
    return jsonResponse({
      ok: true,
      check: SOURCE,
      ready: reachable,
      token_configured: true,
      group_configured: true,
      group_reachable: reachable,
      bot_configured: Boolean(botId),
      message: reachable ? "GroupMe token and group work." : "GroupMe group could not be reached.",
    });
  } catch (error) {
    console.error("GroupMe check failed", error);
    return jsonResponse({
      ok: true,
      check: SOURCE,
      ready: false,
      token_configured: true,
      group_configured: true,
      group_reachable: false,
      bot_configured: Boolean(botId),
      message: "GroupMe token or group could not be verified.",
    });
  }
}

async function main(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const { supabaseUrl, serviceRoleKey, token, groupId, botId } = config();
  const url = new URL(request.url);
  if (request.method === "GET" && url.searchParams.get("check") === SOURCE) return checkGroupMe();

  if (request.method === "GET") {
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ ok: true, ready: false, last_message_id: "", read_count: 0, bot: Boolean(botId) });
    }
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    try {
      const cursor = await getCursor(admin);
      return jsonResponse({
        ok: true,
        ready: Boolean(token && groupId),
        last_message_id: cursor.last_id,
        read_count: cursor.read_count,
        bot: Boolean(botId),
      });
    } catch (error) {
      console.error("Could not read GroupMe status", error);
      return jsonResponse({ ok: false, message: "The GroupMe reader status could not be read." }, 500);
    }
  }

  if (request.method !== "POST") return jsonResponse({ ok: false, message: "Use GET or POST for this reader." }, 405);
  if (!token || !groupId || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, message: "The GroupMe reader is not configured yet." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  try {
    const cursor = await getCursor(admin);
    const result = await readGroupMessages(cursor.last_id);
    const messages = ordered(result.messages);
    if (!cursor.last_id) {
      const newest = messages.at(-1);
      await saveCursor(admin, newest ? messageId(newest) : "", cursor.read_count);
      return jsonResponse({
        ok: true,
        first_run: true,
        last_message_id: newest ? messageId(newest) : "",
        read_count: cursor.read_count,
        processed: 0,
      });
    }

    let lastId = cursor.last_id;
    let readCount = cursor.read_count;
    let sourceName = result.groupName;
    if (!sourceName && messages.length) {
      try {
        sourceName = await readGroupName();
      } catch {
        sourceName = "GroupMe";
      }
    }

    for (const message of messages) {
      const id = messageId(message);
      if (!id) continue;
      lastId = id;
      readCount += 1;
      try {
        if (!shouldSkip(message)) {
          const thread = await threadFor(message);
          const decision = await sendToAgent(message, sourceName || "GroupMe", thread);
          if (decision.already_read !== true) await postDecision(decisionText(decision));
        }
      } catch (error) {
        console.error("Could not process a GroupMe message", error);
      }
      await saveCursor(admin, lastId, readCount);
    }

    return jsonResponse({
      ok: true,
      first_run: false,
      last_message_id: lastId,
      read_count: readCount,
      processed: messages.length,
    });
  } catch (error) {
    console.error("GroupMe reader failed", error);
    return jsonResponse({ ok: false, message: "The GroupMe messages could not be read right now." }, 502);
  }
}

Deno.serve((request) => main(request).catch((error) => {
  console.error("Unhandled GroupMe reader error", error);
  return jsonResponse({ ok: false, message: "The GroupMe reader ran into an unexpected problem." }, 500);
}));
