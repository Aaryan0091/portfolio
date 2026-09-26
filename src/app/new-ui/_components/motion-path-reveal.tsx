"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

export interface Waypoint {
  x: number;
  y: number;
}

export interface MotionPathRevealProps {
  /** Unique id — used to namespace this instance's ScrollTriggers for cleanup. */
  id: string;
  /** Selector for the element(s) that fly in. Multiple matches are staggered. */
  targets: string;
  /** Selector for the element whose scroll position starts the animation. */
  trigger: string;
  /**
   * Waypoints in px, relative to where CSS already puts the element. The FIRST
   * point is where it flies in from; the LAST should be `{x: 0, y: 0}` so it
   * settles exactly into its real layout position. Points in between bend the
   * curve — that's the "where I want it to go" part.
   */
  path: Waypoint[];
  /** ScrollTrigger `start` string. Default fires as the trigger enters view. */
  start?: string;
  /**
   * Tie progress to scroll position instead of letting the timeline run on its
   * own. The flight advances only as far as you scroll and holds still the
   * moment you stop — scroll back up and it rewinds.
   *
   * `true` tracks scroll 1:1. A number adds that many seconds of catch-up
   * smoothing, which reads softer but lags behind the scrollbar.
   */
  scrub?: boolean | number;
  /**
   * Scroll position at which the flight is fully complete. Only meaningful
   * when `scrub` is on — this is what sets how much scrolling the animation
   * is spread across, taking the place of `duration`.
   */
  end?: string;
  /** Easing curve. See the note in the implementation about scrub + easing. */
  ease?: string;
  /** Seconds the flight takes. Ignored when `scrub` is on. */
  duration?: number;
  /** Seconds between each target when `targets` matches more than one. */
  stagger?: number;
  /** How rounded the corners of the path are. 0 = straight lines. */
  curviness?: number;
  /** Tilt the element to follow the curve's tangent. */
  autoRotate?: boolean;
  /** Scale to fly in from. 1 disables the scale-up. */
  fromScale?: number;
  /** Replay every time it re-enters view, instead of only the first time. */
  replay?: boolean;
}

/**
 * Flies elements in along a curved path as the user scrolls to them.
 *
 * Two modes:
 *  - `scrub` on (default): progress is bound to scroll position. Scroll half
 *    way through the range and the flight is half done; stop scrolling and it
 *    holds mid-air; scroll back and it rewinds. `end` sets the range.
 *  - `scrub` off: scroll only trips the trigger, then the timeline plays
 *    itself out over `duration` regardless of what the scroll does next.
 */
export function MotionPathReveal({
  id,
  targets,
  trigger,
  path,
  start = "top 85%",
  scrub = true,
  end = "top 38%",
  ease = "power1.out",
  duration = 1.4,
  stagger = 0.12,
  curviness = 1.4,
  autoRotate = false,
  fromScale = 0.82,
  replay = false,
}: MotionPathRevealProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const scope = `motion-path-${id}`;
    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith(scope))
      .forEach((instance) => instance.kill());

    const elements = gsap.utils.toArray<HTMLElement>(targets);
    const triggerEl = document.querySelector<HTMLElement>(trigger);
    if (elements.length === 0 || !triggerEl || path.length < 2) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Every element is parked at the start of the path, hidden, BEFORE the
      // tween exists.
      //
      // This cannot be left to the tween's own `startAt`, because GSAP applies
      // `startAt` per element at the moment that element's staggered sub-tween
      // begins — not at timeline zero. Staggered elements would therefore sit
      // fully visible in their resting position, then snap out to the path
      // start and fly back in when their turn came. A self-running timeline
      // hides that (it is over in about a second, usually off-screen), but a
      // scrubbed one puts it right in front of the user.
      gsap.set(elements, {
        willChange: "transform, opacity",
        opacity: 0,
        scale: fromScale,
        x: path[0].x,
        y: path[0].y,
      });

      const tween = gsap.to(elements, {
        motionPath: { path, curviness, autoRotate },
        opacity: 1,
        scale: 1,
        // With scrub on, the scroll range set by start/end is what paces the
        // flight; `duration` only decides how the stagger is proportioned
        // inside that range.
        duration,
        stagger,
        // Easing note: under scrub the ease maps onto *scroll distance*, not
        // time. An "inOut" curve therefore means the first chunk of scrolling
        // produces almost no visible movement, which reads as unresponsive —
        // you scroll and nothing happens. An "out" curve moves immediately and
        // settles gently, which is what you want when the scrollbar is the
        // playhead.
        ease,
        scrollTrigger: {
          id: `${scope}-main`,
          trigger: triggerEl,
          start,
          ...(scrub
            ? { end, scrub }
            : {
                toggleActions: replay
                  ? "play reverse play reverse"
                  : "play none none none",
                once: !replay,
              }),
        },
        // Only meaningful for the self-running mode; a scrubbed tween can be
        // reversed back at any time, so its transforms must stay cheap.
        onComplete: scrub
          ? undefined
          : () => gsap.set(elements, { willChange: "auto" }),
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(elements, { clearProps: "all" });
      };
    });

    return () => {
      mm.revert();
    };
  }, [
    id,
    targets,
    trigger,
    path,
    start,
    scrub,
    end,
    ease,
    duration,
    stagger,
    curviness,
    autoRotate,
    fromScale,
    replay,
  ]);

  return null;
}
