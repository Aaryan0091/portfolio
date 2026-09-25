"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Makes a heading look like it is being written as you scroll onto it: a
 * soft-edged mask sweeps left→right across each line in turn, so the letters
 * appear stroke by stroke like ink from a pen rather than all at once.
 *
 * Scroll-bound like everything else on the page: it writes only as far as
 * you scroll, holds when you stop, and un-writes if you scroll back up.
 *
 * The mask itself lives in globals.css (`.new-ui-write-line`) and reads a
 * single CSS variable, `--write`, which is all this component animates. The
 * heading only starts blank while this component has marked it
 * `.is-write-on`, so with no JS or reduced motion it simply shows in full.
 *
 * Each line's share of the scroll is proportional to its width, so the "pen"
 * moves at one constant speed across lines of different lengths — a short
 * "Work" is written quickly, a long "Featured" takes longer.
 *
 * Mount AFTER the Awards and Services pins: ScrollTrigger only accounts for a
 * pin's spacing when measuring triggers created after it.
 */

export interface HeadingWriteOnProps {
  /** Unique id — namespaces this instance's ScrollTrigger for cleanup. */
  id: string;
  /** The heading to trigger on. */
  heading: string;
  /** The heading's line elements, written in DOM order. */
  lines: string;
  /** Trigger position where the first stroke starts. */
  start?: string;
  /** Trigger position where the last stroke finishes. */
  end?: string;
}

/** Mask positions for blank / fully written. Must match globals.css. */
const HIDDEN = "0%";
const SHOWN = "115%";

export function HeadingWriteOn({
  id,
  heading,
  lines,
  start = "top 85%",
  end = "top 40%",
}: HeadingWriteOnProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id === `write-on-${id}`)
      .forEach((instance) => instance.kill());

    const headingEl = document.querySelector<HTMLElement>(heading);
    const lineEls = gsap.utils.toArray<HTMLElement>(lines);

    if (!headingEl || lineEls.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The blank starting state comes from CSS (`.is-write-on`), not from
      // GSAP. A scrubbed timeline sitting at progress 0 hasn't rendered its
      // from-values yet, and ScrollTrigger's refresh strips inline styles, so
      // relying on those left the heading fully written until the first
      // scroll into range. With the class, whatever GSAP clears falls back to
      // blank.
      headingEl.classList.add("is-write-on");

      const tl = gsap.timeline({
        scrollTrigger: {
          id: `write-on-${id}`,
          trigger: headingEl,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      lineEls.forEach((line) => {
        tl.fromTo(
          line,
          { "--write": HIDDEN },
          {
            "--write": SHOWN,
            // Linear: progress is welded to scroll.
            ease: "none",
            // Width-weighted so the pen speed is constant across lines.
            duration: Math.max(1, line.offsetWidth),
          }
        );
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(lineEls, { clearProps: "--write" });
        headingEl.classList.remove("is-write-on");
      };
    });

    return () => {
      mm.revert();
    };
  }, [id, heading, lines, start, end]);

  return null;
}
