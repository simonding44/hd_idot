import { createServerClient } from "@supabase/ssr";

function parseCookieHeader(cookieHeader) {
  const out = new Map();
  if (!cookieHeader) return out;

  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    if (!name) continue;
    const value = part.slice(idx + 1).trim();
    out.set(name, value);
  }

  return out;
}

function serializeCookie(name, value, options = {}) {
  let str = `${name}=${value ?? ""}`;

  if (options.maxAge != null) str += `; Max-Age=${Math.floor(options.maxAge)}`;
  if (options.domain) str += `; Domain=${options.domain}`;
  if (options.path) str += `; Path=${options.path}`;
  if (options.expires) str += `; Expires=${options.expires.toUTCString()}`;

  if (options.httpOnly) str += "; HttpOnly";
  if (options.secure) str += "; Secure";

  // SameSite can be boolean or string in various libs; normalize.
  if (options.sameSite === true) str += "; SameSite=Strict";
  else if (typeof options.sameSite === "string") str += `; SameSite=${options.sameSite}`;

  return str;
}

export function createSupabaseServerClient({ req, res, url, anonKey, cookieOptions }) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = parseCookieHeader(cookieHeader);
  const pendingSetCookies = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return Array.from(cookies.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          cookies.set(name, value);
          pendingSetCookies.push(serializeCookie(name, value, options));
        }
      },
    },
    cookieOptions: cookieOptions ?? undefined,
  });

  function commitCookies() {
    if (!pendingSetCookies.length) return;
    // Preserve any existing Set-Cookie header values.
    const existing = res.getHeader("Set-Cookie");
    if (Array.isArray(existing)) {
      res.setHeader("Set-Cookie", [...existing, ...pendingSetCookies]);
    } else if (typeof existing === "string") {
      res.setHeader("Set-Cookie", [existing, ...pendingSetCookies]);
    } else {
      res.setHeader("Set-Cookie", pendingSetCookies);
    }
  }

  return { supabase, commitCookies };
}
