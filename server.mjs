import dotenv from "dotenv";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSupabaseServerClient } from "./supabase/serverClient.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;

function loadEnvFromProjectDir(projectDir) {
  // Ensure `.env` works even when the process is started from a different CWD.
  // Precedence: OS env > .env.local > .env
  const loadedFromEnvFiles = new Set();

  function loadFile(filePath, allowOverrideFromEnvFiles = false) {
    if (!fs.existsSync(filePath)) return;
    const parsed = dotenv.parse(fs.readFileSync(filePath));
    for (const [key, value] of Object.entries(parsed)) {
      const exists = process.env[key] !== undefined;
      const canOverride = allowOverrideFromEnvFiles && loadedFromEnvFiles.has(key);
      if (!exists || canOverride) {
        process.env[key] = value;
        loadedFromEnvFiles.add(key);
      }
    }
  }

  loadFile(path.join(projectDir, ".env"));
  loadFile(path.join(projectDir, ".env.local"), true);
}

loadEnvFromProjectDir(rootDir);

const port = Number(process.env.PORT || 5173);

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const IS_PROD = process.env.NODE_ENV === "production";
const AUTH_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
]);

function safeJoin(base, target) {
  const targetPath = path.normalize(target).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(base, targetPath);
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function redirect(res, location, setHeaders = {}) {
  send(res, 302, { Location: location, ...setHeaders }, "");
}

function sendJson(res, status, data, setHeaders = {}) {
  send(
    res,
    status,
    { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...setHeaders },
    JSON.stringify(data),
  );
}

function getRequestOrigin(req) {
  const proto = (req.headers["x-forwarded-proto"] || "http").toString().split(",")[0].trim();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "localhost").toString().split(",")[0].trim();
  return `${proto}://${host}`;
}

function redirectBackWithAuthError(req, res, url, code) {
  const origin = getRequestOrigin(req);
  const next = url.searchParams.get("next") || "/";
  const u = new URL(next, origin);
  u.searchParams.set("authError", code);
  redirect(res, u.pathname + u.search + u.hash, { "Cache-Control": "no-store" });
}

async function handleAuthRoute(req, res, url) {
  if (!AUTH_ENABLED) {
    // Keep the site usable even without Supabase configured.
    if (url.pathname === "/auth/me" && req.method === "GET") {
      sendJson(res, 200, {
        enabled: false,
        user: null,
        error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY on server",
      });
      return true;
    }

    if (url.pathname === "/auth/logout" && req.method === "POST") {
      sendJson(res, 200, { enabled: false, ok: true });
      return true;
    }

    if (url.pathname === "/auth/login/google" && req.method === "GET") {
      redirectBackWithAuthError(req, res, url, "missing_supabase_env");
      return true;
    }

    sendJson(res, 404, { error: "Auth not configured" });
    return true;
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

  // Prefer origin-based redirect so it works for localhost + production domains.
  const origin = getRequestOrigin(req);
  const redirectTo = process.env.SUPABASE_REDIRECT_TO || `${origin}/auth/callback`;

  if (url.pathname === "/auth/login/google" && req.method === "GET") {
    const next = url.searchParams.get("next") || "/";
    const oauthRedirectTo = `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: oauthRedirectTo },
    });

    if (error || !data?.url) {
      sendJson(res, 500, { error: error?.message || "Failed to start OAuth" });
      return true;
    }

    // No cookies yet, but keep for symmetry.
    commitCookies();
    redirect(res, data.url, { "Cache-Control": "no-store" });
    return true;
  }

  if (url.pathname === "/auth/callback" && req.method === "GET") {
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!code) {
      send(res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Missing ?code=");
      return true;
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    commitCookies();

    if (error) {
      send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, `Auth error: ${error.message}`);
      return true;
    }

    redirect(res, next, { "Cache-Control": "no-store" });
    return true;
  }

  if (url.pathname === "/auth/logout" && req.method === "POST") {
    const { error } = await supabase.auth.signOut();
    commitCookies();

    if (error) {
      sendJson(res, 500, { error: error.message });
      return true;
    }

    sendJson(res, 200, { ok: true });
    return true;
  }

  if (url.pathname === "/auth/me" && req.method === "GET") {
    // Server-side auth: user is resolved from the Supabase cookies.
    const { data, error } = await supabase.auth.getUser();
    commitCookies();

    if (error) {
      sendJson(res, 200, { enabled: true, user: null, error: error.message });
      return true;
    }

    const user = data?.user
      ? { id: data.user.id, email: data.user.email, user_metadata: data.user.user_metadata }
      : null;
    sendJson(res, 200, { enabled: true, user });
    return true;
  }

  return false;
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith("/auth/")) {
      Promise.resolve(handleAuthRoute(req, res, url)).catch((err) => {
        sendJson(res, 500, { error: err?.message || "Server error" });
      });
      return;
    }

    const rel = pathname === "/" ? "/index.html" : pathname;
    const filePath = safeJoin(rootDir, rel);

    if (!filePath.startsWith(rootDir)) {
      send(res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not Found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = mime.get(ext) || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300",
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch {
    send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Server error");
  }
});

server.listen(port, () => {
  console.log(`Handan Idioms running at http://localhost:${port}/ (root: ${rootDir})`);
  console.log(`Tip: set PORT to change port (e.g. PORT=8080).`);
  if (!AUTH_ENABLED) {
    console.log("Auth: set SUPABASE_URL and SUPABASE_ANON_KEY to enable Google login.");
    console.log(`Auth: expected .env at ${path.join(rootDir, ".env")} (or set OS env vars).`);
  } else {
    console.log(`Auth: Google login enabled (redirect: ${process.env.SUPABASE_REDIRECT_TO || `http://localhost:${port}/auth/callback`}).`);
    console.log(`Auth: cookies are ${IS_PROD ? "Secure" : "not Secure (dev)"} by default (NODE_ENV=${process.env.NODE_ENV || "undefined"}).`);
  }
});
