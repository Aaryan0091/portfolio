"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Work Procedure's step cards deal out from a single card.
 *
 * As the section scrolls into view, the three cards start stacked exactly on
 * top of the middle one — so it reads as ONE card — then fan out sideways to
 * their real places: Discovery to the left, Launch to the right, Development
 * staying put in front. Scroll-bound like the other sections: it spreads only
 * as far as you scroll and folds back up if you scroll back.
 *
 * The stacking offsets are measured, not hardcoded: each outer card is moved
 * by the distance between its centre and the middle card's centre, including
 * the middle card's extra margin-top, so the three line up pixel-for-pixel at
 * the start on any screen width.
 *
 * Desktop-only (above 860px), matching globals.css: below that the cards stack
 * vertically and there is no row to spread across.
 */

/**
 * Where the spread begins/ends, as ScrollTrigger positions on the section's
 * HEADING (not the card row): the cards are fully spread by the time the
 * "Work Procedure" heading's top reaches 12% down the screen — i.e. while
 * the heading is still near the top, the cards already sit in their final
 * row. Tied to the heading so the extra space between the heading and the
 * cards can't delay it. Before SPREAD_START the cards scroll up still
 * stacked, so the single card is on screen before it opens.
 */
const SPREAD_START = "top 62%";
const SPREAD_END = "top 12%";

export function WorkStepsSpread() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith("work-spread"))
      .forEach((instance) => instance.kill());

    const row = document.querySelector<HTMLElement>(".new-ui-work-steps");
    const cards = gsap.utils.toArray<HTMLElement>(".new-ui-step-card");

    if (!row || cards.length !== 3) return;

    const [left, middle, right] = cards;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
      // offsetLeft/offsetTop ignore transforms, so the spread itself can't
      // feed back into these on a refresh.
      const centre = (el: HTMLElement) => ({
        x: el.offsetLeft + el.offsetWidth / 2,
        y: el.offsetTop + el.offsetHeight / 2,
      });
      const offsetTo = (el: HTMLElement, axis: "x" | "y") =>
        centre(middle)[axis] - centre(el)[axis];

      // The middle card is the "front" of the stack. No tilt on the hidden
      // cards: a rotated card of the same size pokes its corners out from
      // behind, and the start has to read as exactly one card.
      gsap.set(middle, { zIndex: 3, position: "relative" });
      gsap.set([left, right], { zIndex: 1, position: "relative" });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "work-spread-main",
          trigger: row.closest("section")?.querySelector("h2") ?? row,
          start: SPREAD_START,
          end: SPREAD_END,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Linear: progress is welded to scroll.
      tl.fromTo(
        left,
        {
          x: () => offsetTo(left, "x"),
          y: () => offsetTo(left, "y"),
        },
        { x: 0, y: 0, ease: "none" },
        0
      ).fromTo(
        right,
        {
          x: () => offsetTo(right, "x"),
          y: () => offsetTo(right, "y"),
        },
        { x: 0, y: 0, ease: "none" },
        0
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(cards, { clearProps: "transform,zIndex,position" });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
