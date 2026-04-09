## 2026-04-09 - [Preventing Timing Attacks in API Auth & Avoid Bundling Backend Secrets]
**Vulnerability:** A simple string comparison `token === DASHBOARD_TOKEN` was used for token authentication in `server/index.js`, making it susceptible to timing attacks. Also, `import.meta.env.DASHBOARD_TOKEN` was being read into the frontend codebase, bundling a sensitive backend token into the frontend client.
**Learning:** Node's `crypto.timingSafeEqual()` combined with hashing standardizes string comparisons to constant time, neutralizing timing attacks regardless of string lengths. Front-end code should exclusively use client-supplied secrets (like `localStorage`) or short-lived auth tokens rather than bundling long-lived backend secrets during build.
**Prevention:** Use `crypto.timingSafeEqual` with hashed strings for any token/password validation. Never map backend environment secrets via `import.meta.env` to front-end bundlers.

## 2026-04-09 - [Preventing Unauthenticated Backend Fallback]
**Vulnerability:** The backend allowed public access if the `DASHBOARD_TOKEN` environment variable was missing, due to a middleware that called `next()` instead of returning an error when the token was not configured.
**Learning:** Security-critical configuration must be strictly enforced. A missing secret should never lead to a "fail-open" state. Implementing immediate process termination at startup and mandatory error responses in middleware ensures a "fail-closed" security posture.
**Prevention:** Implement top-level checks for mandatory security environment variables and exit the process if they are missing. In middleware, ensure that absence of configuration results in an access denial, not a bypass.
