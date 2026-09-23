"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The Awards section's pinned entrance, in three beats:
 *
 *   1. The heading scrolls up normally until its centre hits the centre of the
 *      screen, where it pins.
 *   2. While it is held, the content rises from below the fold.
 *   3. When the content's top edge reaches the heading's vertical centre, the
 *      heading travels upward with it. The pin releases as soon as the content
 *      reaches the viewport top, allowing the next section to enter at once.
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
 * into the heading. The visible heading text follows the content from the
 * frame where the content's top reaches the heading's centre, while the
 * heading's box remains pinned so the section geometry does not jump.
 *
 * WHY THE NEGATIVE MARGIN: that lift is a transform, so it does not shrink the
 * section's box. Left alone it would leave a ~434px hole between Awards and the
 * next section. `--awards-lift` is published from here and pulls the section's
 * bottom up by the same amount. It is set only inside the matchMedia block, so
 * reduced-motion and mobile keep the untouched layout.
 */

/**
 * Pin length, as a multiple of viewport height. The full length is movement.
 *
 * Was 1.15 (~9 wheel notches on a 768px screen). 0.8 trims about three notches
 * off the section; the content still travels the same on-screen distance, just
 * a little faster than the page scrolls.
 */
const PIN_LENGTH_RATIO = 0.8;

/**
 * How far past the pin point (in px of scrolling) the content's top edge
 * should cross the bottom of the viewport. One wheel notch is ~100px, so this
 * makes the content start rising into view on the second notch after the
 * heading locks, instead of after four notches of empty screen.
 *
 * Why this is needed at all: `pinSpacing` pushes the content down by the full
 * pin length, so left at y = 0 it starts `restTop + pinLength` down — about
 * 624px below the fold at 768px tall. The rise below starts it from just under
 * the fold instead.
 */
const ENTER_AFTER_PX = 100;

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
    const headingText = document.querySelector<HTMLElement>(
      ".new-ui-awards-heading-text"
    );
    const layout = document.querySelector<HTMLElement>(".new-ui-awards-layout");
    const items = gsap.utils.toArray<HTMLElement>(contentSelector);

    if (!section || !heading || !headingText || !layout || items.length === 0)
      return;

    // A previous hot-reloaded version of this sequence faded the heading out.
    // Kill any surviving tween and remove the inline opacity it may have left
    // behind so the heading always uses its bright CSS colour at every point.
    gsap.killTweensOf(heading);
    gsap.set(heading, { clearProps: "opacity" });

    const mm = gsap.matchMedia();

    // Below the grid's own breakpoint the section stacks into one column and
    // there is not enough vertical room for a pin to read as anything but a
    // stutter, so this is desktop-only.
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      // --- geometry, recomputed on every refresh so resizes stay correct ---
      // Floored so a very short viewport can never make the pin shorter than
      // the entry distance, which would divide by ~zero in startBelowFold.
      const pinLength = () =>
        Math.max(
          ENTER_AFTER_PX + 240,
          Math.round(window.innerHeight * PIN_LENGTH_RATIO)
        );

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

      /** How far the content must move to finish just below the viewport top. */
      const lift = () => restTop() - MIN_TOP;

      /**
       * How far below the viewport's bottom edge the content should be parked
       * at the moment the heading pins, so that it crosses into view exactly
       * ENTER_AFTER_PX later.
       *
       * The content has to travel from (vh + below) down to MIN_TOP on screen
       * across the pin, so it moves at rate r = (vh + below - MIN_TOP) / pin
       * per px scrolled. Requiring below / r = ENTER_AFTER_PX and solving:
       *
       *     below = ENTER_AFTER_PX * (vh - MIN_TOP) / (pin - ENTER_AFTER_PX)
       */
      const startBelowFold = () => {
        const vh = window.innerHeight;
        return (ENTER_AFTER_PX * (vh - MIN_TOP)) / (pinLength() - ENTER_AFTER_PX);
      };

      /**
       * The y offset that puts the content at (vh + below) when the pin starts.
       * Its natural position then is restTop + pinLength (see ENTER_AFTER_PX).
       */
      const startY = () =>
        window.innerHeight + startBelowFold() - (restTop() + pinLength());

      const applyLiftCompensation = () => {
        section.style.setProperty("--awards-lift", `${Math.round(lift())}px`);
      };
      applyLiftCompensation();

      const syncHeadingWithContent = () => {
        const headingBounds = heading.getBoundingClientRect();
        const headingCenter = headingBounds.top + headingBounds.height / 2;
        const overlap = layout.getBoundingClientRect().top - headingCenter;
        gsap.set(headingText, { y: Math.min(0, overlap) });
      };

      gsap.set(layout, { willChange: "transform" });
      gsap.set(items, { willChange: "opacity" });
      gsap.set(headingText, { y: 0, willChange: "transform" });

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
          onRefresh: () => {
            applyLiftCompensation();
            syncHeadingWithContent();
          },
          onUpdate: syncHeadingWithContent,
        },
      });

      // Beat 2+3 — rise continuously from just below the fold to the viewport
      // top. Starting at startY rather than 0 is what makes the content appear
      // on the second scroll instead of the fifth.
      tl.fromTo(
        layout,
        { y: () => startY() },
        {
          y: () => -lift(),
          // Linear: progress is welded to scroll, and an eased curve would
          // break the "this much scroll, this much movement" mapping.
          ease: "none",
          duration: 1,
        },
        0
      )
        // Content fades up as it enters, staggered. Timed so it is already
        // about half opaque when its top crosses the fold (ENTER_AFTER_PX), so
        // what rises into view is clearly readable rather than a faint ghost.
        // The heading's opacity is never animated; only its inner text moves
        // once overlap begins.
        .fromTo(
          items,
          { opacity: 0 },
          { opacity: 1, ease: "none", stagger: 0.05, duration: 0.3 },
          0
        );

      // The hand-off to Services (keeping its heading off screen until this
      // section has gone) now lives in services-showcase.tsx, as spacing on
      // that section rather than a fade here.

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        section.style.removeProperty("--awards-lift");
        gsap.set([headingText, layout, ...items], { clearProps: "all" });
      };
    });

    return () => {
      mm.revert();
      gsap.killTweensOf(heading);
      gsap.set(heading, { clearProps: "opacity" });
    };
  }, []);

  return null;
}
