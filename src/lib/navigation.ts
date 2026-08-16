/* ============================================================
   MomenKita — Instant Navigation helpers
   ------------------------------------------------------------
   Route changes must feel instant. The site sets
   `scroll-behavior: smooth` globally (nice for same-page anchors),
   but that ALSO makes programmatic `window.scrollTo(0, 0)` animate
   on every route change — which makes navigation feel slow.

   `scrollToTopInstant()` forces the scroll to the top immediately
   (same frame) regardless of the global CSS smooth behavior, so a
   menu click → route change → top-of-page happens in one tap.
   ============================================================ */

const INSTANT = 'instant' as ScrollBehavior;

/** Instantly scroll the window to the top, bypassing CSS smooth scroll. */
export const scrollToTopInstant = (): void => {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: INSTANT });
  } catch {
    // Older browsers may throw on an unknown ScrollBehavior value —
    // fall back to temporarily disabling the global smooth behavior.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }
};
