## 2026-04-09 - [Preventing Timing Attacks in API Auth & Avoid Bundling Backend Secrets]
**Vulnerability:** A simple string comparison `token === DASHBOARD_TOKEN` was used for token authentication in `server/index.js`, making it susceptible to timing attacks. Also, `import.meta.env.DASHBOARD_TOKEN` was being read into the frontend codebase, bundling a sensitive backend token into the frontend client.
**Learning:** Node's `crypto.timingSafeEqual()` combined with hashing standardizes string comparisons to constant time, neutralizing timing attacks regardless of string lengths. Front-end code should exclusively use client-supplied secrets (like `localStorage`) or short-lived auth tokens rather than bundling long-lived backend secrets during build.
**Prevention:** Use `crypto.timingSafeEqual` with hashed strings for any token/password validation. Never map backend environment secrets via `import.meta.env` to front-end bundlers.

## 2026-04-09 - [Preventing Unauthenticated Backend Fallback]
**Vulnerability:** The backend allowed public access if the `DASHBOARD_TOKEN` environment variable was missing, due to a middleware that called `next()` instead of returning an error when the token was not configured.
**Learning:** Security-critical configuration must be strictly enforced. A missing secret should never lead to a "fail-open" state. Implementing immediate process termination at startup and mandatory error responses in middleware ensures a "fail-closed" security posture.
**Prevention:** Implement top-level checks for mandatory security environment variables and exit the process if they are missing. In middleware, ensure that absence of configuration results in an access denial, not a bypass.

## 2026-04-09 - [Missing Client IP Forwarding in Nginx]
**Vulnerability:** Missing client IP forwarding headers in the Nginx configuration.
**Learning:** In a reverse proxy setup, the backend receives the proxy's IP address instead of the client's. This renders security measures like rate limiting and IP-based auditing ineffective, as all traffic appears to originate from the same source.
**Prevention:** Always include `proxy_set_header X-Real-IP $remote_addr;` and `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` in Nginx proxy configurations to ensure the backend can correctly identify and rate-limit individual clients.

## 2026-04-10 - [Preventing Fail-Open CORS Configurations]
**Vulnerability:** The CORS configuration used a "fail-open" approach (`allowedOrigins.length === 0`) which allowed all origins to access the backend if the `ALLOWED_ORIGINS` environment variable was not set.
**Learning:** This is a recurring pattern of "fail-open" configurations where a missing setting leads to wide-open access, neutralizing the security control entirely.
**Prevention:** Implement "fail-closed" defaults for all security controls. If an environment variable is expected but missing, either deny access (like CORS blocking unknown origins and defaulting only to safe local environments) or refuse to start the service entirely.

## 2026-04-11 - [Preventing Hash-based DoS & Enhancing Auth Audit]
**Vulnerability:** The authentication middleware was hashing the incoming `x-dashboard-token` header without enforcing a maximum length, potentially exposing the server to CPU-exhaustion Denial of Service (DoS) attacks if an attacker sent extremely large payloads. Additionally, failed authentication attempts lacked audit logging, making brute-force or probing attempts harder to detect.
**Learning:** Cryptographic functions like `crypto.createHash` are computationally expensive. Processing unbound user input with these functions is a common vector for DoS. Furthermore, robust authentication systems must log failures (including origin IP) for incident response and monitoring.
**Prevention:** Implement strict length validation on all inputs before passing them to cryptographic functions (e.g., `token.length > 256`). Always add structured audit logging (e.g., `console.warn`) containing contextual information like `req.ip` for security-critical failures.

## 2026-04-14 - [Preventing Express Error Stack Trace Leaks]
**Vulnerability:** The Express framework by default leaks full stack traces in HTML responses when uncaught errors occur, especially during CORS rejections (e.g., calling `callback(new Error('CORS blocked'))`).
**Learning:** Returning raw framework errors directly to the client exposes internal application details and potentially sensitive stack traces. A generic, properly structured JSON response protects application internals.
**Prevention:** Implement a global error-handling middleware (`app.use((err, req, res, next) => { ... })`) at the end of the routing definitions. This acts as a catch-all to log the error server-side and return generic, secure HTTP status codes and JSON payloads to the client.

## 2026-04-16 - [Preventing Cache Data Leakage of Sensitive Information]
**Vulnerability:** The `/api/dashboard` endpoint, which returns sensitive financial transaction and balance data, did not include headers to prevent client-side or intermediary caching.
**Learning:** Browsers and proxy servers can aggressively cache API responses. If an authenticated user views sensitive financial data on a shared or compromised device, this data could persist in the browser's cache or a proxy's memory long after the session has ended, leading to potential data leakage.
**Prevention:** Always apply strict anti-caching headers (`Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, `Pragma: no-cache`, `Expires: 0`, `Surrogate-Control: no-store`) to any API endpoints returning sensitive financial, PII, or auth-related data.

## 2026-04-17 - [Secure Token Storage in Frontend]
**Vulnerability:** The application was storing the sensitive `dashboard_token` in `localStorage`. This allowed the token to persist indefinitely across browser sessions, increasing the risk of unauthorized access if the device was shared or compromised.
**Learning:** `localStorage` provides long-term persistence, which is suitable for non-sensitive preferences (like UI theme) but inappropriate for authentication tokens. `sessionStorage` provides an automatic mechanism to clear sensitive data when the browsing session ends (i.e., tab or browser closure).
**Prevention:** Store sensitive authentication tokens exclusively in `sessionStorage` or HTTP-only cookies to minimize their lifespan and exposure window on the client side. Reserve `localStorage` solely for non-sensitive, user-preference data.

## 2026-04-18 - [Preventing Express Error HTML Info Leaks & Malformed JSON Crash]
**Vulnerability:** Express by default leaks routing paths via HTML 404 pages (e.g. `Cannot GET /route`) and throws internal HTML/text stack trace errors when `express.json()` encounters a malformed JSON payload.
**Learning:** Returning default HTML pages for non-existent routes or payload parsing errors exposes framework behaviors and internal stack details to an attacker/scanner, making recon easier. Explicitly catching SyntaxErrors from the JSON body parser and globally handling 404s ensures APIs only ever return consistent, secure JSON boundaries.
**Prevention:** Always implement a custom 404 handler (`app.use((req, res) => { res.status(404)... })`) before the global error handler, and inject a targeted middleware immediately after `express.json()` to catch `SyntaxError`s specifically where `err.status === 400` and `'body' in err`.

## 2026-04-19 - [Frontend External API Timeout Protection & Client-Side Payload Limiting]
**Vulnerability:** External `fetch` calls in the frontend (`src/App.tsx` and `src/components/DolarPill.tsx`) lacked a timeout mechanism. The token input in `src/App.tsx` also lacked a maximum length limit, allowing arbitrarily large payloads to be pasted on the client-side.
**Learning:** `fetch` calls in the browser do not time out by default. If an external API is slow or hangs, the application UI can hang indefinitely, leading to a degraded user experience or resource exhaustion. Furthermore, defense-in-depth requires enforcing length limits (like `maxLength={256}`) on the client-side to prevent users from accidentally or intentionally pasting massive strings, matching the backend's validation.
**Prevention:** Always use `AbortSignal.timeout(ms)` with `fetch` calls in the frontend to ensure requests fail fast. Enforce `maxLength` on form inputs handling sensitive or potentially large data.

## 2026-04-26 - [Preventing CRLF (Log Injection) Vulnerabilities]
**Vulnerability:** User inputs such as `origin` in the CORS handler and `req.originalUrl` in the 404 handler were being logged directly to `console.warn`. This allows an attacker to inject carriage return (`\r`) and line feed (`\n`) characters into the request, effectively forging log entries and making auditing/investigation difficult or deceptive.
**Learning:** Directly logging untrusted input is a security risk. If logging systems do not escape characters automatically, attackers can exploit this to create fake log entries (CRLF injection), potentially hiding malicious activity or creating false positives.
**Prevention:** Always sanitize untrusted input before logging it. For example, use `.replace(/[\r\n]/g, '')` to strip out newline characters, ensuring that a single event generates exactly one log line.
