import { getAuthConfig, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method Not Allowed" }, { Allow: "POST" });
    return;
  }

  const cfg = getAuthConfig(req, res);
  if (!cfg.enabled) {
    sendJson(res, 200, { enabled: false, ok: true });
    return;
  }

  const { supabase, commitCookies } = cfg;
  const { error } = await supabase.auth.signOut();
  commitCookies();

  if (error) {
    sendJson(res, 500, { error: error.message });
    return;
  }

  sendJson(res, 200, { ok: true });
}

