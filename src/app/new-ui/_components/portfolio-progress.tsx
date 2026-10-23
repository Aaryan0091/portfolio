"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * "Portfolio completion": a thin glowing line along the top edge of the
 * screen that fills left→right as the visitor works through the page, and is
 * full once they reach the bottom.
 *
 * It is also the page's scrollbar — the browser's own one is hidden on the
 * New UI (globals.css) so this line can run the full width. Click anywhere
 * along the top edge to jump there, or press and drag to scrub through the
 * page; the smoother eases the content after it like any other scroll.
 *
 * Tracks the whole page's scroll, so pinned sections (Awards, Services,
 * Featured Work) count as progress too. Updates write straight to the DOM
 * rather than through React state, so scrolling never re-renders anything.
 *
 * Must render OUTSIDE #smooth-content: it is position: fixed, and a
 * transformed ancestor would drag it along with the page.
 */
export function PortfolioProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const track = trackRef.current;
    const bar = barRef.current;
    if (!track || !bar) return;

    // Progress is the real scroll position over the real maximum, both in
    // window units — so it is exactly 1 the moment you hit the bottom. (The
    // trigger's own progress mixed units once the smoother's `speed` went
    // below 1, and the smoother's eased progress only reached 1 after its
    // catch-up animation, which no scroll event reported.)
    const render = () => {
      const max = ScrollTrigger.maxScroll(window);
      const progress = gsap.utils.clamp(0, 1, max > 0 ? window.scrollY / max : 0);
      bar.style.transform = `scaleX(${progress})`;
      track.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    };

    const trigger = ScrollTrigger.create({
      id: "portfolio-progress",
      start: 0,
      end: "max",
      onUpdate: render,
      onRefresh: render,
    });
    render();
    // Also on the browser's own scroll events, so the very last pixel of a
    // scroll always lands.
    window.addEventListener("scroll", render, { passive: true });

    // --- Dragging, like a scrollbar ----------------------------------------
    let dragging = false;
    const scrollToPointer = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const share = gsap.utils.clamp(0, 1, (clientX - rect.left) / rect.width);
      // "instant": the page's CSS asks for smooth scrolling, which would
      // make the browser animate every drag step and lag behind the pointer.
      // The smoother still eases the content after it.
      window.scrollTo({
        top: share * ScrollTrigger.maxScroll(window),
        behavior: "instant",
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      dragging = true;
      // Keep receiving moves even when the pointer leaves the thin strip.
      try {
        track.setPointerCapture(event.pointerId);
      } catch {
        // Not capturable (e.g. synthetic events) — window listeners below
        // still follow the drag.
      }
      track.classList.add("is-dragging");
      scrollToPointer(event.clientX);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragging) scrollToPointer(event.clientX);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      track.classList.remove("is-dragging");
    };

    track.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      trigger.kill();
      window.removeEventListener("scroll", render);
      track.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="new-ui-progress-bar"
      role="scrollbar"
      aria-controls="smooth-wrapper"
      aria-label="Page progress"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <span ref={barRef} />
    </div>
  );
}
