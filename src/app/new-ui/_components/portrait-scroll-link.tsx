"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

/**
 * The AG card's journey from the hero into the About section, driven strictly
 * by scroll position: scroll N% of the range, and the card is N% through its
 * journey. Stop scrolling and it stops dead. Scroll back and it reverses.
 *
 * TWO separate things have to be right for that to hold, and missing either
 * one makes the animation appear to "play itself":
 *
 *  1. `scrub: true`, never a number. A numeric scrub (`scrub: 1.5`) treats the
 *     scroll position as a target and eases toward it over that many seconds,
 *     so the card keeps moving after the wheel stops. That is the opposite of
 *     scroll-driven.
 *
 *  2. `ease: "none"` on the travel. This one is easy to miss. Under a scrub
 *     the easing curve maps onto scroll *distance*, so with `power2.inOut`
 *     scrolling 25% of the range moved the card only ~15% of the way, then it
 *     lurched through the middle. Progress was technically tied to scroll, but
 *     not *proportionally*, which reads as the animation having a mind of its
 *     own. Linear is the only curve where "this much scroll" reliably equals
 *     "this much animation".
 *
 * Checkpoints, as fractions of the scroll range below:
 *
 *     0%  ── card sits in the hero, full size
 *    25%  ── one third of the way along the arc
 *    50%  ── half way, at the arc's widest point
 *    75%  ── arrived and resized; crossfade begins  (TRAVEL_END)
 *   100%  ── handover complete, it is now the About card
 *
 * The two cards sit ~430px apart — comfortably inside one viewport — so the
 * whole flight stays on screen.
 *
 * Because both cards are in normal document flow, the translate between them
 * is a constant in document space — it does not depend on scroll position, so
 * the card lands dead-on however fast the user scrolls during the flight.
 *
 * NOTE: ScrollSmoother (see smooth-scroll.tsx) adds ~1.2s of catch-up to the
 * page's own scrolling, so the content — and therefore this animation — keeps
 * drifting briefly after the wheel stops. That is the page scrolling, not the
 * timeline running on its own. Lower `smooth` there to tighten it further.
 */

/**
 * Fraction of the scroll range spent travelling. The remainder is the
 * crossfade. Both are expressed against the timeline below so the checkpoints
 * in the comment stay accurate if this is changed.
 */
const TRAVEL_END = 0.75;

/**
 * The band of scrolling the whole journey is spread across.
 *
 * Start is absolute scroll position 0, so the card begins moving on the very
 * first notch of the wheel rather than waiting for the destination card to
 * climb into view.
 *
 * TARGET_DRIFT IS THE SENSITIVITY DIAL. Because progress is welded to scroll,
 * the width of this band is the only thing controlling how much animation you
 * get per notch of wheel — there is no "speed" to turn up. Smaller = more
 * sensitive. Larger = more gradual.
 *
 * This dial is bounded at BOTH ends, and the maths is worth keeping here.
 *
 * The card's screen position while travelling is:
 *
 *     screenY = HERO_Y + progress * GAP - scroll
 *             = HERO_Y + scroll * (GAP / travelRange - 1)
 *
 * where GAP (~432px) is the document distance between the two cards. So:
 *
 *   travelRange < GAP  → card drifts DOWN the screen as you scroll
 *   travelRange = GAP  → card appears pinned in place while the page moves
 *   travelRange > GAP  → card drifts UP the screen
 *
 * The range is DERIVED at runtime, not hardcoded, because GAP scales with the
 * viewport (section padding and heading sizes are all vw-based) while a fixed
 * pixel range does not. A constant tuned at 1024px wide put the ratio at
 * 731/735 ~ 0.99 by 1440px — the card falling at almost exactly scroll speed,
 * appearing pinned for the entire flight. Deriving it keeps the drift
 * consistent at every width.
 *
 * Two bounds apply:
 *
 *  - TARGET_DRIFT sets how fast the card should climb the screen relative to
 *    scrolling. Rearranging `drift = 1 - GAP / travelRange` gives the range
 *    needed to hit it.
 *  - MIN_LANDING_Y is the ceiling. At the landing the destination card sits at
 *    (aboutDocY - range) on screen, so too large a range puts the handover
 *    above the top of the viewport where nobody sees it.
 */
const RANGE_START = 0;

/** Fraction of scroll speed the card visibly climbs by. Higher = more motion. */
const TARGET_DRIFT = 0.25;

/**
 * Keep the landing at least this far below the top of the viewport, as a
 * fraction of viewport height. Viewport-relative rather than a fixed pixel
 * count so short laptop screens do not push the handover off the top.
 */
const MIN_LANDING_Y_RATIO = 0.28;
const MIN_LANDING_Y_FLOOR = 140;

/**
 * How much of the horizontal travel is spent in the first third of the flight.
 *
 * Sideways motion is what sells the movement early on — nothing else on the
 * page moves horizontally, so it cannot be mistaken for the page scrolling.
 * But it has to be FRONT-LOADED rather than bowed: the hero card already sits
 * near the right margin, so an arc that bulges outward before curving back
 * swings it clean off the right edge of the viewport, and it also has to
 * reverse direction somewhere, which is its own dead spot.
 *
 * Front-loading instead keeps x monotonic — the card always tracks toward its
 * destination, never doubles back, and never leaves the span between start and
 * landing. Drag it live at /new-ui?path-editor=1.
 */
const X_LEAD = 0.55;

// Internal timeline length. Under a scrub this sets proportions, not speed —
// the scroll range does the pacing. Splitting it by TRAVEL_END keeps the
// timeline and the documented checkpoints in lockstep.
const flightDuration = 1.5;
const travelDuration = flightDuration * TRAVEL_END;
const crossfadeDuration = flightDuration - travelDuration;

export function PortraitScrollLink() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    // React Strict Mode double-invokes effects in dev, which would otherwise
    // leave a stale instance fighting the fresh one over the same node.
    // Scoped by id prefix so it doesn't clobber other scroll components.
    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith("portrait-link"))
      .forEach((instance) => instance.kill());

    const heroPortrait = document.querySelector<HTMLElement>(".new-ui-portrait");
    const aboutPortrait = document.querySelector<HTMLElement>(".new-ui-about-portrait");

    if (!heroPortrait || !aboutPortrait) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
      const startRect = heroPortrait.getBoundingClientRect();
      const endRect = aboutPortrait.getBoundingClientRect();

      // Centre-to-centre, so a single uniform scale grows the card evenly from
      // every edge instead of distorting it.
      const dx =
        endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
      const dy =
        endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
      const scale = endRect.width / startRect.width;

      // Derive the scroll range from the measured geometry — see the note at
      // the top of this file for why this cannot be a fixed number.
      const gap = Math.abs(dy);
      const aboutDocY = endRect.top + window.scrollY;
      const idealRange = gap / ((1 - TARGET_DRIFT) * TRAVEL_END);

      // The card ARRIVES at TRAVEL_END (75%) of the range, not at 100% — the
      // last quarter is the crossfade, by which point it is already sitting on
      // the destination. So the ceiling has to be solved against the arrival
      // scroll position, `rangeLength * TRAVEL_END`, not the full range.
      //
      // Getting this wrong over-constrained the range badly: it clamped the
      // range far below what TARGET_DRIFT wanted (collapsing the drift toward
      // "pinned"), while the position it was protecting was one the card had
      // already passed hundreds of pixels earlier.
      const minLandingY = Math.max(
        MIN_LANDING_Y_FLOOR,
        window.innerHeight * MIN_LANDING_Y_RATIO
      );
      const ceiling = (aboutDocY - minLandingY) / TRAVEL_END;
      const rangeLength = Math.round(Math.max(240, Math.min(idealRange, ceiling)));

      // Four waypoints, spaced EVENLY in y (0, ⅓, ⅔, 1).
      //
      // This spacing is the whole point. What the eye reads as "the animation
      // is running" is the card's movement on *screen*, and that is
      //
      //     screenDelta = (how fast the card falls) - (how fast you scroll)
      //
      // so the card looks frozen at any moment those two happen to match. A
      // three-point arc bunched at the midpoint made the card's fall rate
      // surge through the middle of the curve, and it hit scroll speed at
      // around 175px in — right where the sideways swing was also reversing,
      // so both components cancelled at once and the card sat dead still for
      // most of a scroll notch before "waking up".
      //
      // Even y-spacing keeps the fall rate near-constant, so the gap between
      // it and the scroll rate never closes and the card drifts continuously
      // from the very first notch. x is front-loaded but monotonic, adding
      // clearly visible sideways travel early without ever doubling back.
      const flightPath = [
        { x: 0, y: 0 },
        { x: dx * X_LEAD, y: dy * (1 / 3) },
        { x: dx * (X_LEAD + (1 - X_LEAD) * 0.65), y: dy * (2 / 3) },
        { x: dx, y: dy },
      ];

      // z-index 30 keeps the travelling card above the About section, which
      // opens its own stacking context and would otherwise paint over it.
      gsap.set(heroPortrait, {
        transformOrigin: "center center",
        zIndex: 30,
        willChange: "transform, opacity",
      });
      gsap.set(aboutPortrait, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "portrait-link-main",
          trigger: aboutPortrait,
          start: RANGE_START,
          end: `+=${rangeLength}`,
          // Welded to the scrollbar. Deliberately NOT a number — see the note
          // at the top of this file.
          scrub: true,
        },
      });

      tl.to(
        heroPortrait,
        {
          // Lower curviness than a decorative arc would use: rounder curves
          // redistribute speed toward the middle, which is what produced the
          // dead spot. 1.0 keeps the path smooth without bunching it.
          motionPath: { path: flightPath, curviness: 1, autoRotate: false },
          scale,
          duration: travelDuration,
          // Linear so scroll distance maps 1:1 onto journey distance. Any
          // in/out curve here breaks the checkpoints documented above.
          ease: "none",
        },
        0
      )
        // By now the travelling card sits exactly on top of the destination at
        // exactly its size, so the handover is invisible — it just becomes the
        // About card. Given its own quarter of the scroll range rather than a
        // quick swap, so there are visible in-between steps as it settles.
        .to(
          heroPortrait,
          { opacity: 0, duration: crossfadeDuration, ease: "none" },
          travelDuration
        )
        .to(
          aboutPortrait,
          { opacity: 1, duration: crossfadeDuration, ease: "none" },
          travelDuration
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set([heroPortrait, aboutPortrait], { clearProps: "all" });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
