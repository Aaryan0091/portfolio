"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A round "View" badge that replaces the mouse pointer while it is over any
 * element marked `data-view-cursor` (the Featured Work project cards).
 *
 * It follows the mouse with a short lag, pops in when you move onto a card
 * and shrinks away when you leave. Hover is re-checked on scroll as well as on
 * mouse movement: with smooth scrolling, a card can slide under a mouse that
 * isn't moving, and no mouse event fires for that.
 *
 * Only for devices with a real hover-capable pointer. Touch screens keep
 * their normal behaviour, and the native cursor is only hidden once this has
 * mounted (via `.has-view-cursor` on <html>), so it can never vanish with no
 * replacement.
 *
 * Must render OUTSIDE #smooth-content: it is position: fixed, and a
 * transformed ancestor would drag it along with the page.
 */
export function ViewCursor() {
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-view-cursor");

    gsap.set(badge, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    const xTo = gsap.quickTo(badge, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(badge, "y", { duration: 0.35, ease: "power3.out" });

    let x = -1;
    let y = -1;
    let active = false;

    const setActive = (next: boolean) => {
      if (next === active) return;
      active = next;
      if (next) {
        // Appear at the pointer, not sliding in from wherever it last was.
        gsap.set(badge, { x, y });
        xTo(x, x);
        yTo(y, y);
      }
      gsap.to(badge, {
        scale: next ? 1 : 0,
        opacity: next ? 1 : 0,
        duration: next ? 0.35 : 0.2,
        ease: next ? "back.out(1.7)" : "power2.in",
        overwrite: "auto",
      });
    };

    const check = () => {
      if (x < 0) return;
      const hit = document.elementFromPoint(x, y);
      setActive(Boolean(hit?.closest("[data-view-cursor]")));
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      xTo(x);
      yTo(y);
      check();
    };
    const onLeave = () => setActive(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", check, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", check);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-view-cursor");
      gsap.killTweensOf(badge);
    };
  }, []);

  return (
    <div className="new-ui-view-cursor" ref={badgeRef} aria-hidden="true">
      View
    </div>
  );
}
