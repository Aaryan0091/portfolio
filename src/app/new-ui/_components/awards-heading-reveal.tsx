"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// The Awards heading is deliberately absent: it has its own pinned sequence in
// awards-pin-sequence.tsx, and a fade/dim driven from here would fight it —
// the dim is keyed to the heading's scroll position, which stops changing the
// moment it pins.
const revealSelectors = [".new-ui-services-main-heading"];

export function AwardsHeadingReveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith("heading-reveal"))
      .forEach((instance) => instance.kill());

    const headings = revealSelectors
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: Array<() => void> = [];

      headings.forEach((heading, index) => {
        gsap.set(heading, { opacity: 0 });

        // Fades in as it scrolls up into view...
        const enter = gsap.fromTo(
          heading,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              id: `heading-reveal-enter-${index}`,
              trigger: heading,
              start: "top bottom",
              end: "top 55%",
              scrub: true,
            },
          }
        );

        // ...then dims (not fully gone) as later content scrolls up over it.
        const dim = gsap.to(heading, {
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            id: `heading-reveal-dim-${index}`,
            trigger: heading,
            start: "top 55%",
            end: "top 5%",
            scrub: true,
          },
        });

        cleanups.push(() => {
          enter.scrollTrigger?.kill();
          enter.kill();
          dim.scrollTrigger?.kill();
          dim.kill();
        });
      });

      return () => cleanups.forEach((fn) => fn());
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
