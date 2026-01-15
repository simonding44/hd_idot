import { createSupabaseServerClient } from "../../supabase/serverClient.mjs";

function send(res, status, headers, body) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers || {})) res.setHeader(k, v);
  res.end(body);
}

export function sendJson(res, status, data, extraHeaders = {}) {
  send(
    res,
    status,
    { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders },
    JSON.stringify(data),
  );
}

export function redirect(res, location, extraHeaders = {}) {
  send(res, 302, { Location: location, "Cache-Control": "no-store", ...extraHeaders }, "");
}

export function getRequestOrigin(req) {
  const proto = (req.headers["x-forwarded-proto"] || "http").toString().split(",")[0].trim();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "localhost").toString().split(",")[0].trim();
  return `${proto}://${host}`;
}

export function getAuthConfig(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
  const AUTH_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

  // Vercel sets NODE_ENV=production in production deployments.
  const IS_PROD = process.env.NODE_ENV === "production";

  if (!AUTH_ENABLED) {
    return {
      enabled: false,
      error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY on server",
    };
  }

  const { supabase, commitCookies } = createSupabaseServerClient({
    req,
    res,
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    cookieOptions: {
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
    },
  });

  // Prefer origin-based redirect so it works for preview + production domains.
  const origin = getRequestOrigin(req);
  const fallbackRedirectTo = `${origin}/auth/callback`;
  let redirectTo = process.env.SUPABASE_REDIRECT_TO || fallbackRedirectTo;

  // Guardrail: a common misconfig is leaving a localhost redirect in production env.
  if (IS_PROD) {
    try {
      const u = new URL(redirectTo);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        redirectTo = fallbackRedirectTo;
      }
    } catch {
      // If SUPABASE_REDIRECT_TO is invalid, fall back safely.
      redirectTo = fallbackRedirectTo;
    }
  }

  return { enabled: true, supabase, commitCookies, redirectTo };
}
