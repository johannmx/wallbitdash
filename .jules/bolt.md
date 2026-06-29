# Bolt's Journal - Critical Learnings Only

This journal contains critical learnings, performance bottlenecks, and edge cases discovered in this codebase.

## 2026-06-12 - RefreshTimer setInterval Re-creation Bottleneck
**Learning:** React effects that set a `setInterval` must avoid dependencies that change on every tick (like `timeLeft`), otherwise the interval is constantly destroyed and recreated every second, wasting CPU cycles.
**Action:** Move the interval logic to a dependency-free effect (running on mount) and trigger the refresh via a separate effect listening to `timeLeft`.

## 2026-06-19 - Sequential External API Fetch Latency Bottleneck
**Learning:** Sequential await calls on independent API queries (checking/stocks balance, exchange rates, and transaction history) cause high latency and increase fail-risk. A single timeout or failure in the sequence blocks subsequent requests from running and slows startup.
**Action:** Always wrap independent third-party API fetch queries in `Promise.all` with individual `.catch()` handlers to run them in parallel and ensure resilience against partial failures.

## 2026-06-29 - Timezone-Shifting and Slow Date Localization in Render Loops
**Learning:** Parsing absolute date strings (like `YYYY-MM-DD`) using `new Date('YYYY-MM-DD' + 'T00:00:00Z')` inside rendering/aggregation loops, followed by `toLocaleDateString()`, is extremely slow (~24x slower than string split) and introduces a timezone-shifting bug. For negative timezone offsets (e.g., UTC-3 in America/Argentina), it shifts the date/month backwards, grouping transactions into the wrong periods.
**Action:** Use high-performance, timezone-safe string parsing to format absolute date strings (`YYYY-MM-DD` -> `D/M/YYYY` or custom key logic) to guarantee correctness and maximize rendering performance.
