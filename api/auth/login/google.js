import { getAuthConfig, getRequestOrigin, redirect, sendJson } from "../_utils.js";

function redirectBackWithAuthError(req, res, next, code) {
  const origin = getRequestOrigin(req);
  const u = new URL(next || "/", origin);
  u.searchParams.set("authError", code);
  redirect(res, u.pathname + u.search + u.hash);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" }, { Allow: "GET" });
    return;
  }

  const url = new URL(req.url || "/", getRequestOrigin(req));
  const next = url.searchParams.get("next") || "/";

  const cfg = getAuthConfig(req, res);
  if (!cfg.enabled) {
    redirectBackWithAuthError(req, res, next, "missing_supabase_env");
    return;
  }

  const { supabase, commitCookies, redirectTo } = cfg;
  const oauthRedirectTo = `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: oauthRedirectTo },
  });

  if (error || !data?.url) {
    sendJson(res, 500, { error: error?.message || "Failed to start OAuth" });
    return;
  }

  // No cookies yet, but keep for symmetry and future changes.
  commitCookies();
  redirect(res, data.url);
}
