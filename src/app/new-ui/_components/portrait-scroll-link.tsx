"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PortraitScrollLink() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const heroPortrait = document.querySelector<HTMLElement>(".new-ui-portrait");
    const aboutPortrait = document.querySelector<HTMLElement>(".new-ui-about-portrait");
    const heroSection = document.querySelector<HTMLElement>(".new-ui-hero");

    if (!heroPortrait || !aboutPortrait || !heroSection) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
      const startRect = heroPortrait.getBoundingClientRect();
      const endRect = aboutPortrait.getBoundingClientRect();

      // Both elements move 1:1 with normal scroll, so the extra transform
      // needed to make heroPortrait land on aboutPortrait's spot is just
      // this constant delta — no pinning or fixed positioning required.
      const dx = endRect.left - startRect.left;
      const dy = endRect.top - startRect.top;
      const scaleX = endRect.width / startRect.width;
      const scaleY = endRect.height / startRect.height;

      gsap.set(heroPortrait, { transformOrigin: "top left", zIndex: 30 });
      gsap.set(aboutPortrait, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "bottom bottom",
          end: "+=500",
          scrub: 0.4,
        },
      });

      tl.fromTo(
        heroPortrait,
        { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        { x: dx, y: dy, scaleX, scaleY, ease: "none" },
        0
      )
        .fromTo(aboutPortrait, { opacity: 0 }, { opacity: 1, ease: "none" }, 0.75)
        .to(heroPortrait, { opacity: 0, ease: "none" }, 0.92);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
