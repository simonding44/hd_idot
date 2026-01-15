import { getAuthConfig, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" }, { Allow: "GET" });
    return;
  }

  const cfg = getAuthConfig(req, res);
  if (!cfg.enabled) {
    sendJson(res, 200, { enabled: false, user: null, error: cfg.error });
    return;
  }

  const { supabase, commitCookies } = cfg;
  const { data, error } = await supabase.auth.getUser();
  commitCookies();

  if (error) {
    sendJson(res, 200, { enabled: true, user: null, error: error.message });
    return;
  }

  const user = data?.user
    ? { id: data.user.id, email: data.user.email, user_metadata: data.user.user_metadata }
    : null;
  sendJson(res, 200, { enabled: true, user });
}

