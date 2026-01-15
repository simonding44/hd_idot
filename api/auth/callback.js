import { getAuthConfig, getRequestOrigin, redirect, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" }, { Allow: "GET" });
    return;
  }

  const url = new URL(req.url || "/", getRequestOrigin(req));
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    sendJson(res, 400, { error: "Missing ?code=" });
    return;
  }

  const cfg = getAuthConfig(req, res);
  if (!cfg.enabled) {
    // If env is missing on the callback route, fall back to a clean redirect.
    redirect(res, next);
    return;
  }

  const { supabase, commitCookies } = cfg;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  commitCookies();

  if (error) {
    sendJson(res, 500, { error: `Auth error: ${error.message}` });
    return;
  }

  redirect(res, next);
}
