import { withSupabase } from "npm:@supabase/server@1.4.1";

const CALENDAR_HOST = "calendar.google.com";
const ALLOWED_ORIGIN = "https://skoda-spada.vercel.app";
const MAX_ICS_BYTES = 2 * 1024 * 1024;

function isRaKPreviewOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" &&
      /^skoda-spada-[a-z0-9-]+-martinspadrnas-projects\.vercel\.app$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

function originAllowed(req: Request) {
  const origin = String(req.headers.get("origin") || "").trim();
  return !origin || origin === ALLOWED_ORIGIN || isRaKPreviewOrigin(origin);
}

function responseHeaders(req: Request, contentType = "application/json; charset=utf-8") {
  const headers: Record<string, string> = {
    "cache-control": "no-store, max-age=0",
    "content-type": contentType,
    "vary": "Origin",
    "x-content-type-options": "nosniff",
  };
  const origin = String(req.headers.get("origin") || "").trim();
  if (origin === ALLOWED_ORIGIN) {
    headers["access-control-allow-origin"] = ALLOWED_ORIGIN;
  } else if (isRaKPreviewOrigin(origin)) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

function jsonResponse(req: Request, status: number, error: string) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: responseHeaders(req),
  });
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

const authenticatedFetch = withSupabase({ auth: "user" }, async (req, ctx) => {
  if (!originAllowed(req)) return jsonResponse(req, 403, "origin_not_allowed");
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { ...responseHeaders(req), allow: "GET, HEAD, OPTIONS" },
    });
  }

  const { data: profile, error: profileError } = await ctx.supabase.rpc("rak_admin_context");
  if (profileError || !profile || (profile.role !== "owner" && profile.role !== "admin")) {
    return jsonResponse(req, 403, "admin_permission_required");
  }

  const calendarUrl = String(Deno.env.get("RAK_ABSENCE_ICS_URL") || "").trim();
  if (!validCalendarUrl(calendarUrl)) return jsonResponse(req, 500, "calendar_not_configured");

  try {
    const text = await fetchCalendar(calendarUrl);
    return new Response(req.method === "HEAD" ? null : text, {
      status: 200,
      headers: responseHeaders(req, "text/calendar; charset=utf-8"),
    });
  } catch {
    return jsonResponse(req, 502, "calendar_fetch_failed");
  }
});

export default {
  fetch(req: Request, context: unknown) {
    if (req.method === "OPTIONS") {
      if (!originAllowed(req)) return jsonResponse(req, 403, "origin_not_allowed");
      return new Response(null, {
        status: 204,
        headers: {
          ...responseHeaders(req),
          "access-control-allow-headers": "authorization, apikey, content-type",
          "access-control-allow-methods": "GET, HEAD, OPTIONS",
          "access-control-max-age": "600",
        },
      });
    }
    return authenticatedFetch(req, context);
  },
};
