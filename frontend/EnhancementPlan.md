# App Enhancement Plan (Team Lead Perspective)

Based on the current codebase, here are the strategic enhancements recommended to bring the application to production-grade performance and reliability.

## 1. State Management Optimization
**Issue:** The `StockProvider` uses a monolithic `stocks` object. Every price update (which can be frequent) recreates this object, triggering a re-render of the entire list and all cards.

**Proposed Change:**
- Migrate to **Zustand** or **Recoil**.
- Use **Selectors** so that a `StockCard` only re-renders when its specific symbol's price changes.

## 2. Robust Data Fetching
**Issue:** Current fetching uses raw `fetch` inside `useEffect`, lacking caching and sophisticated error handling.

**Proposed Change:**
- Implement **TanStack Query (React Query)**.
- This will provide automatic caching, background synchronization, and a cleaner API for handling loading/error states across the app.

## 3. Technical Debt & Polish
- **Environment Variables:** Move `API_BASE_URL` and `WS_URL` to a `.env` file.
- **Accessibility (a11y):** Add `aria-live="polite"` to price updates for screen readers.
- **Visual Feedback:** Implement micro-animations (e.g., green/red flashes) on `StockCard` when prices move to improve the "live" feel.
