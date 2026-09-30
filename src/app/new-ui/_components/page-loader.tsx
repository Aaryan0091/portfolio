"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundLines } from "./background-lines";

/**
 * Loading screen shown while the portfolio gets ready: the site's dark teal
 * with its glowing lines, the AG mark, "Aaryan Gupta" in the heading script,
 * a progress line and a percentage.
 *
 * The percentage is real progress: it counts what has actually finished —
 * the page's own load, the web fonts, and every image on the page — and
 * counts up smoothly towards that. It reaches 100% and fades out once all of
 * it is done. (The hero video isn't counted: it streams in afterwards on its
 * own, over the photo — see hero-video.tsx.)
 *
 * It is part of the server HTML, so it covers the page from the very first
 * paint. Limits, so nobody gets stuck on it:
 *   - shown for at least MIN_MS, so a fast load doesn't just flicker;
 *   - forced to 100% and dismissed after MAX_MS no matter what;
 *   - and if JavaScript never runs, a CSS animation removes it after 6s.
 *
 * Must render OUTSIDE #smooth-content (position: fixed).
 */

const MIN_MS = 900;
const MAX_MS = 5000;
/** How often the percentage updates (~30 times a second). */
const TICK_MS = 33;

export function PageLoader() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const [percent, setPercent] = useState(0);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const started = performance.now();
    let fontsDone = false;
    let pageDone = document.readyState === "complete";
    let forced = false;
    let shown = 0;
    let timer = 0;
    let leaving = false;

    document.fonts?.ready.then(() => {
      fontsDone = true;
    });
    const onLoad = () => {
      pageDone = true;
    };
    window.addEventListener("load", onLoad, { once: true });
    const cap = window.setTimeout(() => {
      forced = true;
    }, MAX_MS);

    /** Share of the tracked work that has finished, 0–1. */
    const target = () => {
      if (forced) return 1;
      // Only images the page needs up front. Lazy ones (the About and
      // Awards photos) load when scrolled near and would otherwise hold the
      // loader until MAX_MS on every visit.
      const images = Array.from(document.images).filter(
        (image) => image.loading !== "lazy"
      );
      const imagesDone = images.filter((image) => image.complete).length;
      const total = 2 + images.length;
      const done = (fontsDone ? 1 : 0) + (pageDone ? 1 : 0) + imagesDone;
      return done / total;
    };

    const tick = () => {
      // Ease the shown value towards the real one, always moving a little so
      // it never looks frozen, but never past what has actually loaded.
      const goal = target();
      shown = Math.min(goal, shown + Math.max((goal - shown) * 0.12, 0.004));
      const value = Math.round(shown * 100);
      setPercent(value);
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;

      const complete = goal >= 1 && value >= 100;
      if (complete && !leaving) {
        leaving = true;
        const wait = Math.max(0, MIN_MS - (performance.now() - started));
        window.setTimeout(() => {
          setPhase("leaving");
          // Remove it once the 600ms fade is over, even if the browser
          // skips the transitionend event (e.g. a background tab).
          window.setTimeout(() => setPhase("gone"), 700);
        }, wait);
        return;
      }
      timer = window.setTimeout(tick, TICK_MS);
    };
    // A timer rather than requestAnimationFrame: animation frames pause in
    // background tabs, which froze the counter at 0% until the tab was
    // looked at.
    tick();

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(cap);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`new-ui-loader${phase === "leaving" ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && phase === "leaving") {
          setPhase("gone");
        }
      }}
    >
      <span className="sr-only">Loading portfolio…</span>
      <div className="new-ui-loader-lines" aria-hidden="true">
        <BackgroundLines pulsesPerLine={2} />
      </div>
      <div className="new-ui-loader-content" aria-hidden="true">
        <span className="new-ui-loader-mark">AG</span>
        <span className="new-ui-loader-name">Aaryan Gupta</span>
        <span className="new-ui-loader-bar">
          <span ref={barRef} />
        </span>
        <span className="new-ui-loader-percent">{percent}%</span>
      </div>
    </div>
  );
}
