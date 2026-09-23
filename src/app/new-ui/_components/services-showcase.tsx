"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * "Services I Offer" as a pinned horizontal showcase:
 *
 *   1. The heading scrolls up the screen and stops dead in the middle — the
 *      same entrance as Awards & Experiences — at which point the whole
 *      section (a full-screen stage) pins.
 *   2. While it is held, vertical scrolling slides the service cards across
 *      horizontally, in the band below the heading. They start parked just
 *      off the right edge, so nothing rises toward the heading on the way in.
 *      At the same time the heading climbs steadily up the screen, leaving off
 *      the top at the exact moment the last card arrives — so the cards finish
 *      the showcase on their own.
 *   3. When the last card reaches the right-hand margin the pin releases and
 *      the section scrolls away normally.
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
 * Vertical scroll spent per pixel of horizontal travel. 1 would be a straight
 * 1:1 mapping, which makes the ~2,500px track take ~25 wheel notches; 0.65
 * brings that to ~16. Lower = cards move faster per scroll.
 */
const SCROLL_PER_PX = 0.65;

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

    if (!section || !track || !heading) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("is-showcase");

      // All viewport-derived, re-evaluated on every refresh.
      const edge = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;

      /** First card's left edge sits exactly at the viewport's right edge. */
      const startX = () => window.innerWidth - edge();

      /** Last card's right edge sits at the right-hand margin. */
      const endX = () => Math.min(0, window.innerWidth - track.scrollWidth);

      const travel = () => Math.max(1, startX() - endX());

      /**
       * How far the heading must climb to leave the screen: its bottom edge
       * reaching the top of the stage, which is the top of the viewport while
       * pinned. offsetTop/offsetHeight ignore transforms, so the climb itself
       * can't feed back into this number on a refresh.
       */
      const headingExit = () => heading.offsetTop + heading.offsetHeight;

      // One timeline for both movements, so they share a single scroll range:
      // the heading is guaranteed to leave the top at exactly the moment the
      // last card reaches its margin, rather than two separate ranges merely
      // being tuned to line up.
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "services-showcase-main",
          trigger: section,
          // The stage's top meets the viewport's top at the same instant the
          // heading (at the stage's centre) reaches the screen's centre.
          start: "top top",
          end: () => `+=${Math.round(travel() * SCROLL_PER_PX)}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Both linear: progress is welded to scroll, so "this much scroll" is
      // always "this much slide" and "this much climb".
      tl.fromTo(track, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0)
        .fromTo(
          heading,
          { y: 0 },
          { y: () => -headingExit(), ease: "none", duration: 1 },
          0
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set([track, heading], { clearProps: "transform" });
        section.classList.remove("is-showcase");
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
