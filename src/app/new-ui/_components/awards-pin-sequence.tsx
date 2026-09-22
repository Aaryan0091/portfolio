"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The Awards section's pinned entrance, in four beats:
 *
 *   1. The heading scrolls up normally until its centre hits the centre of the
 *      screen, where it pins.
 *   2. While it is held, the content rises from below the fold.
 *   3. The content climbs PAST the heading — the heading fades out as it is
 *      covered — and comes to rest centred in the viewport.
 *   4. It holds there, then the pin releases and the whole section scrolls on.
 *
 * WHY PIN THE HEADING AND NOT THE SECTION: the section is taller than the
 * viewport, and pinning a container taller than the screen leaves its bottom
 * permanently cut off. Pinning just the heading avoids that, and `pinSpacing`
 * gets the "rise from far below" for free — the spacer pushes the content down
 * by the pin length, and ordinary scrolling carries it back up.
 *
 * WHY THE CONTENT NEEDS A LIFT AT ALL: with the heading pinned mid-screen, the
 * content's natural resting place is directly beneath it —
 * `(vh - headingH)/2 + headingH + margin`, about 446px down on a 768px screen.
 * Ordinary scrolling can never bring it higher than that, no matter how long
 * the pin runs, because the spacer grows by exactly the amount the content
 * rises. Reaching the centre means translating it a further ~434px, straight
 * over the heading. That overlap is the reason the heading has to fade.
 *
 * WHY THE NEGATIVE MARGIN: that lift is a transform, so it does not shrink the
 * section's box. Left alone it would leave a ~434px hole between Awards and the
 * next section. `--awards-lift` is published from here and pulls the section's
 * bottom up by the same amount. It is set only inside the matchMedia block, so
 * reduced-motion and mobile keep the untouched layout.
 */

/** Pin length, as a multiple of viewport height. Rise + hold share this. */
const PIN_LENGTH_RATIO = 1.15;

/** Fraction of the pin spent rising. The rest is the hold at centre. */
const RISE_END = 0.72;

/** Smallest gap kept above the content when it is taller than the viewport. */
const MIN_TOP = 12;

const contentSelector =
  ".new-ui-awards-intro, .new-ui-awards-card, .new-ui-awards-side";

export function AwardsPinSequence() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith("awards-pin"))
      .forEach((instance) => instance.kill());

    const section = document.querySelector<HTMLElement>(".new-ui-awards");
    const heading = document.querySelector<HTMLElement>(".new-ui-awards-heading");
    const layout = document.querySelector<HTMLElement>(".new-ui-awards-layout");
    const items = gsap.utils.toArray<HTMLElement>(contentSelector);

    if (!section || !heading || !layout || items.length === 0) return;

    const mm = gsap.matchMedia();

    // Below the grid's own breakpoint the section stacks into one column and
    // there is not enough vertical room for a pin to read as anything but a
    // stutter, so this is desktop-only.
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      // --- geometry, recomputed on every refresh so resizes stay correct ---
      const pinLength = () => Math.round(window.innerHeight * PIN_LENGTH_RATIO);

      // Captured BEFORE the pin exists. GSAP moves a pinned element's margins
      // onto the spacer it creates, so reading margin-bottom afterwards returns
      // 0 — which silently made the lift 64px short and left the content
      // resting below centre. It is a rem value, so it is safe to treat as
      // constant across resizes; the heading's height is not, and is still
      // measured live below.
      const headingMarginBottom =
        parseFloat(getComputedStyle(heading).marginBottom) || 0;

      /** Where the content sits, on screen, at the end of the pin with y = 0. */
      const restTop = () => {
        const vh = window.innerHeight;
        const headingH = heading.offsetHeight;
        return (vh - headingH) / 2 + headingH + headingMarginBottom;
      };

      /** Where the content should come to rest: centred, or just below the top. */
      const targetTop = () =>
        Math.max(MIN_TOP, (window.innerHeight - layout.offsetHeight) / 2);

      /** How far the content must be translated up to reach `targetTop`. */
      const lift = () => restTop() - targetTop();

      const applyLiftCompensation = () => {
        section.style.setProperty("--awards-lift", `${Math.round(lift())}px`);
      };
      applyLiftCompensation();

      gsap.set(layout, { willChange: "transform" });
      gsap.set(items, { willChange: "opacity" });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "awards-pin-main",
          trigger: heading,
          // "the element's centre reaches the screen's centre"
          start: "center center",
          end: () => `+=${pinLength()}`,
          pin: heading,
          pinSpacing: true,
          // Applies the pin a frame early, removing the jolt you otherwise get
          // when pinning at speed.
          anticipatePin: 1,
          scrub: true,
          // Every distance above is viewport-derived, so they must be
          // re-evaluated on resize rather than baked in at build time.
          invalidateOnRefresh: true,
          onRefresh: applyLiftCompensation,
        },
      });

      // Beat 2+3 — rise from below the fold, past the heading, to centre.
      tl.fromTo(
        layout,
        { y: 0 },
        {
          // Overshoot the final lift by the distance the page will still scroll
          // during the hold, so the hold can give it back and leave the content
          // visually stationary.
          y: () => -(lift() + pinLength() * (1 - RISE_END)),
          // Linear: progress is welded to scroll, and an eased curve would
          // break the "this much scroll, this much movement" mapping.
          ease: "none",
          duration: RISE_END,
        },
        0
      )
        // Beat 4 — hold. y relaxes back toward the true lift at exactly the
        // rate the page scrolls, which leaves the content parked on screen.
        .to(
          layout,
          { y: () => -lift(), ease: "none", duration: 1 - RISE_END },
          RISE_END
        )
        // Content fades up early in the rise, staggered.
        .fromTo(
          items,
          { opacity: 0 },
          { opacity: 1, ease: "none", stagger: 0.08, duration: RISE_END * 0.55 },
          0
        )
        // The heading dims out across the window where the content is climbing
        // over it, so the two never fight for the same pixels.
        .to(heading, { opacity: 0, ease: "none", duration: 0.26 }, 0.4);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        section.style.removeProperty("--awards-lift");
        gsap.set([layout, ...items], { clearProps: "all" });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
