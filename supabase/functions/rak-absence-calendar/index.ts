const CALENDAR_HOST = "calendar.google.com";
const MAX_ICS_BYTES = 2 * 1024 * 1024;
const encoder = new TextEncoder();

function responseHeaders(contentType = "application/json; charset=utf-8") {
  return {
    "cache-control": "no-store, max-age=0",
    "content-type": contentType,
    "x-content-type-options": "nosniff",
  };
}

function jsonResponse(status: number, error: string) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: responseHeaders(),
  });
}

async function equalSecret(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

async function hasServerAccess(req: Request) {
  const provided = String(req.headers.get("apikey") || "").trim();
  const expected = String(Deno.env.get("RAK_CALENDAR_PROXY_TOKEN") || "").trim();
  return !!provided && !!expected && await equalSecret(provided, expected);
}

function validCalendarUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" &&
      parsed.hostname === CALENDAR_HOST &&
      parsed.pathname.startsWith("/calendar/ical/");
  } catch {
    return false;
  }
}

async function readLimitedBody(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_ICS_BYTES) throw new Error("calendar_response_too_large");
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_ICS_BYTES) {
      await reader.cancel();
      throw new Error("calendar_response_too_large");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return new TextDecoder().decode(body);
}

async function fetchCalendar(url: string, redirectCount = 0): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8",
      "user-agent": "RaK rotation absence calendar importer",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });

  if (response.status >= 300 && response.status < 400) {
    if (redirectCount >= 3) throw new Error("calendar_redirect_limit");
    const location = response.headers.get("location");
    const nextUrl = location ? new URL(location, url).toString() : "";
    if (!validCalendarUrl(nextUrl)) throw new Error("calendar_redirect_not_allowed");
    return fetchCalendar(nextUrl, redirectCount + 1);
  }
  if (!response.ok) throw new Error(`calendar_fetch_failed:${response.status}`);

  const text = await readLimitedBody(response);
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("calendar_invalid_response");
  return text;
}

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { ...responseHeaders(), allow: "GET, HEAD" },
    });
  }
  if (!(await hasServerAccess(req))) return jsonResponse(401, "authentication_required");

  const calendarUrl = String(Deno.env.get("RAK_ABSENCE_ICS_URL") || "").trim();
  if (!validCalendarUrl(calendarUrl)) return jsonResponse(500, "calendar_not_configured");

  try {
    const text = await fetchCalendar(calendarUrl);
    return new Response(req.method === "HEAD" ? null : text, {
      status: 200,
      headers: responseHeaders("text/calendar; charset=utf-8"),
    });
  } catch {
    return jsonResponse(502, "calendar_fetch_failed");
  }
});
