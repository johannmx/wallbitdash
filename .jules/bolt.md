# Bolt's Journal - Critical Learnings Only

This journal contains critical learnings, performance bottlenecks, and edge cases discovered in this codebase.

## 2026-06-12 - RefreshTimer setInterval Re-creation Bottleneck
**Learning:** React effects that set a `setInterval` must avoid dependencies that change on every tick (like `timeLeft`), otherwise the interval is constantly destroyed and recreated every second, wasting CPU cycles.
**Action:** Move the interval logic to a dependency-free effect (running on mount) and trigger the refresh via a separate effect listening to `timeLeft`.
