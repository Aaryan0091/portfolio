"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * "Portfolio completion": a thin glowing line along the top edge of the
 * screen that fills left→right as the visitor works through the page, and is
 * full once they reach the bottom.
 *
 * Tracks the whole page's scroll, so pinned sections (Awards, Services,
 * Featured Work) count as progress too. Updates write straight to the DOM
 * rather than through React state, so scrolling never re-renders anything.
 *
 * Must render OUTSIDE #smooth-content: it is position: fixed, and a
 * transformed ancestor would drag it along with the page.
 */
export function PortfolioProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const bar = barRef.current;
    if (!bar) return;

    const render = (progress: number) => {
      bar.style.transform = `scaleX(${progress})`;
    };

    const trigger = ScrollTrigger.create({
      id: "portfolio-progress",
      start: 0,
      end: "max",
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(trigger.progress);

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div className="new-ui-progress-bar" aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}
