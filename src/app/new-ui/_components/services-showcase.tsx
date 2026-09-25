"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * "Services I Offer" as a pinned horizontal showcase:
 *
 *   1. The heading scrolls up the screen to the middle, where the whole
 *      section (a full-screen stage) pins.
 *   2. PHASE A — from that same moment, the heading climbs off the top of the
 *      screen while card 01 starts sliding in from the RIGHT edge. The card is
 *      held to a slow pace here, so its leading edge only reaches the
 *      heading's text once the heading has left: the two never coincide.
 *   3. PHASE B — with the heading gone, the cards run right-to-left at normal
 *      speed in a zig-zag (alternating between a band above centre and a band
 *      below it, each tucked partway under the last).
 *   4. When the last card reaches the right-hand margin the pin releases and
 *      the section scrolls away normally.
 *
 * WHY TWO PHASES: the upper band sits exactly where a climbing heading passes.
 * At one constant speed, card 01 would reach the heading text (about a quarter
 * of the way in) while the heading was still in the upper band. Holding
 * the card just short of the text until the heading has cleared the screen
 * makes the no-overlap a guarantee rather than a tuning result. Both of those
 * positions come from live measurements, so it holds on any screen size.
 *
 * Layout for this mode lives in globals.css under `.new-ui-services.is-showcase`.
 * The class is added from inside the matchMedia block below, so it exists only
 * while this animation is running — mobile and reduced-motion users keep the
 * normal stacked layout.
 *
 * MOUNT ORDER MATTERS: this must be created after AwardsPinSequence and before
 * any scroll triggers further down the page (the section reveals). The pin adds
 * spacing, and ScrollTrigger only accounts for a pin when measuring triggers
 * that were created after it.
 */

/**
 * Scroll spent on phase A — the heading's climb off the top while card 01
 * edges in. ~100px per wheel notch, so this is about 3.5 scrolls.
 */
const HEADING_EXIT_PX = 350;

/**
 * Vertical scroll spent per pixel of horizontal travel in phase B. Lower =
 * cards move faster per scroll.
 */
const SCROLL_PER_PX = 0.65;

/** How far short of the heading's text card 01 stops during phase A. */
const CLEARANCE_PX = 24;

/** Scroll over which the progress line fades in once the heading has gone —
 * long enough that it eases in rather than popping up. */
const LINE_FADE_PX = 150;

/**
 * Seconds the line's draw-on and glow take to catch up with the scroll.
 * The zig-zag itself moves with the cards 1:1 (it must stay threaded through
 * them), but the drawing and brightening glide after the scroll position
 * instead of stepping with every wheel notch.
 */
const LINE_DRAW_SMOOTHING = 0.6;

/** Opacity of the line's soft glow at the start and end of the run. */
const LINE_GLOW_START = 0.15;
const LINE_GLOW_END = 0.9;

export function ServicesShowcase() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith("services-showcase"))
      .forEach((instance) => instance.kill());

    const section = document.querySelector<HTMLElement>(".new-ui-services");
    const track = document.querySelector<HTMLElement>(".new-ui-services-list");
    const heading = document.querySelector<HTMLElement>(
      ".new-ui-services-main-heading"
    );
    const line = document.querySelector<SVGSVGElement>(".new-ui-services-line");
    const lineBase = document.querySelector<SVGPathElement>(
      ".new-ui-services-line-base"
    );
    const lineFill = document.querySelector<SVGPathElement>(
      ".new-ui-services-line-fill"
    );
    const lineGlow = document.querySelector<SVGPathElement>(
      ".new-ui-services-line-glow"
    );

    if (
      !section ||
      !track ||
      !heading ||
      !line ||
      !lineBase ||
      !lineFill ||
      !lineGlow
    )
      return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("is-showcase");

      // --- geometry, re-evaluated on every refresh --------------------------
      // offsetTop/scrollWidth ignore transforms, so the animation's own
      // movement can never feed back into these numbers.

      const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;

      /** Right edge of the heading's TEXT (the element itself is full width). */
      const headingTextRight = () => {
        const range = document.createRange();
        range.selectNodeContents(heading);
        const textWidth = range.getBoundingClientRect().width;
        return (heading.clientWidth + textWidth) / 2;
      };

      /** Card 01 (leftmost) has its left edge exactly at the right edge. */
      const startX = () => window.innerWidth - padLeft();

      /** End of phase A: card 01's left edge stops just short of the text. */
      const phaseAX = () =>
        startX() -
        Math.max(0, window.innerWidth - headingTextRight() - CLEARANCE_PX);

      /** End: the last card's right edge sits on the right margin. */
      const endX = () => Math.min(0, window.innerWidth - track.scrollWidth);

      /** How far the heading climbs to be fully off the top of the stage. */
      const headingExit = () => heading.offsetTop + heading.offsetHeight;

      /**
       * Rebuilds the zig-zag. Points are in stage coordinates at track x = 0
       * (the SVG gets the same x as the track).
       *
       * The core is one corner per card: bottom-centre of each upper card,
       * top-centre of each lower card. That rhythm — same horizontal step,
       * same two heights — is then continued outward past the first and last
       * card until it reaches the screen's left edge at the start of phase B
       * (x = -phaseAX) and its right edge at the end (x = vw - endX). Joining
       * those edges straight to the nearest card made one long, shallow
       * segment that read as a straight line; continuing the pattern keeps it
       * a zig-zag from the first pixel. The outermost segments are cut exactly
       * at the edges.
       *
       * Every segment stays in the middle strip between the bands, so the
       * line only ever meets a card at the card's inner edge.
       */
      const buildLine = () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          ".new-ui-service-card",
          track
        );
        if (cards.length < 2) return;

        const corners: [number, number][] = cards.map((card, index) => [
          track.offsetLeft + card.offsetLeft + card.offsetWidth / 2,
          track.offsetTop +
            card.offsetTop +
            (index % 2 === 0 ? card.offsetHeight : 0),
        ]);
        const upperY = corners[0][1];
        const lowerY = corners[1][1];
        const step = corners[1][0] - corners[0][0];
        const leftEdge = -phaseAX();
        const rightEdge = window.innerWidth - endX();

        /** Extends the pattern from `from` in `direction` until `edge`. */
        const extend = (
          from: [number, number],
          direction: 1 | -1,
          edge: number
        ) => {
          const out: [number, number][] = [];
          let [x, y] = from;
          while (direction * (edge - x) > 0 && step > 0) {
            const nextX = x + direction * step;
            const nextY = y === upperY ? lowerY : upperY;
            if (direction * (nextX - edge) >= 0) {
              // Cut this segment exactly at the edge.
              const t = (edge - x) / (nextX - x);
              out.push([edge, y + (nextY - y) * t]);
              break;
            }
            out.push([nextX, nextY]);
            [x, y] = [nextX, nextY];
          }
          return out;
        };

        const points = [
          ...extend(corners[0], -1, leftEdge).reverse(),
          ...corners,
          ...extend(corners[corners.length - 1], 1, rightEdge),
        ];

        const d = points
          .map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(" ");
        lineBase.setAttribute("d", d);
        lineFill.setAttribute("d", d);
        lineGlow.setAttribute("d", d);
      };

      // Redrawn AFTER each refresh: during refreshInit the pinned stage still
      // has the old viewport's height, which put the lower cards' corners in
      // the wrong place after a resize. The draw-on below uses pathLength="1"
      // (see page.tsx), so it never depends on the path's real length and
      // redrawing late is harmless.
      buildLine();
      ScrollTrigger.addEventListener("refresh", buildLine);

      // Phase B's share of the scroll is fixed when the timeline is built. The
      // positions above are what guarantee no overlap, so a resize can only
      // nudge speeds, never correctness.
      const phaseBScroll = Math.round(
        Math.max(1, phaseAX() - endX()) * SCROLL_PER_PX
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "services-showcase-main",
          trigger: section,
          // The stage's top meets the viewport's top at the same instant the
          // heading (at the stage's centre) reaches the screen's centre.
          start: "top top",
          end: `+=${HEADING_EXIT_PX + phaseBScroll}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Durations are in px of scroll, so each tween owns exactly its share of
      // the pin. All linear: progress is welded to scroll.
      tl.fromTo(
        heading,
        { y: 0 },
        { y: () => -headingExit(), ease: "none", duration: HEADING_EXIT_PX },
        0
      )
        // The line rides along with the track so it stays threaded through
        // the cards.
        .fromTo(
          [track, line],
          { x: startX },
          { x: phaseAX, ease: "none", duration: HEADING_EXIT_PX },
          0
        )
        .fromTo(
          [track, line],
          { x: phaseAX },
          {
            x: endX,
            ease: "none",
            duration: phaseBScroll,
            immediateRender: false,
          },
          HEADING_EXIT_PX
        )
        // Progress line appears. Starts exactly as phase B does — the
        // heading is fully off screen by then, so the two are never visible
        // together.
        .fromTo(
          line,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "sine.inOut",
            duration: Math.min(LINE_FADE_PX, phaseBScroll),
          },
          HEADING_EXIT_PX
        );

      // The line draws itself left→right and brightens over exactly phase
      // B's stretch of scroll, reaching the screen's right edge at full glow
      // as the last card lands. It's its own timeline so it can have a little
      // scrub smoothing (see LINE_DRAW_SMOOTHING) without loosening the
      // cards. Positions are taken from the main pin's start, which has
      // already been measured by the time this one refreshes.
      const drawTl = gsap.timeline({
        scrollTrigger: {
          id: "services-showcase-draw",
          trigger: section,
          start: () => (tl.scrollTrigger?.start ?? 0) + HEADING_EXIT_PX,
          end: () =>
            (tl.scrollTrigger?.start ?? 0) + HEADING_EXIT_PX + phaseBScroll,
          scrub: LINE_DRAW_SMOOTHING,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none", duration: 1 },
      });

      // Via attributes, not CSS: GSAP rounds CSS px values to whole pixels,
      // which on a pathLength of 1 turned the draw-on into a jump from hidden
      // to fully drawn.
      drawTl
        .fromTo(
          [lineFill, lineGlow],
          { attr: { "stroke-dasharray": 1, "stroke-dashoffset": 1 } },
          { attr: { "stroke-dashoffset": 0 } },
          0
        )
        // The glow is a blurred copy of the line whose opacity rises, instead
        // of an animated drop-shadow filter: re-filtering the whole long line
        // every frame was expensive enough to drop frames.
        .fromTo(
          lineGlow,
          { opacity: LINE_GLOW_START },
          { opacity: LINE_GLOW_END },
          0
        );

      return () => {
        drawTl.scrollTrigger?.kill();
        drawTl.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set([track, heading], { clearProps: "transform" });
        ScrollTrigger.removeEventListener("refresh", buildLine);
        gsap.set([line, lineFill, lineGlow], { clearProps: "all" });
        [lineFill, lineGlow].forEach((path) => {
          path.removeAttribute("stroke-dasharray");
          path.removeAttribute("stroke-dashoffset");
        });
        section.classList.remove("is-showcase");
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
