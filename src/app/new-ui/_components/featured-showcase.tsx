"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Featured Work's zoom sequence.
 *
 * The tiles first arrive and sit in their scattered layout as normal. Once
 * the tile row reaches the middle of the screen the tiles hold still while
 * the "Featured Work" heading carries on scrolling up and off the screen, so
 * only the projects are left in view. Then each project takes a turn:
 *
 *   1. GROW   — the tile swells, from where it sits, into a large case-study
 *               panel (coloured frame, artwork inset, big title top-left,
 *               tagline bottom-right) while the rest dims. It pivots on a
 *               point inside the tile, so it enlarges out of its own spot.
 *   2. HOLD   — the panel stays up for a few scrolls.
 *   3. SHRINK — it shrinks back into its tile, and the next project begins.
 *
 * All of it is scroll-bound and linear, like the rest of the page: it only
 * moves as far as you scroll, holds when you stop, and plays backwards when
 * you scroll up. When the last project is back in place the pin releases.
 *
 * HOW THE "TILE GROWS" ILLUSION WORKS: each project has an overlay panel
 * (rendered in page.tsx) that is hidden until its turn. At the start of the
 * turn the overlay is placed exactly over its tile — same box, same artwork,
 * same small label — and swapped in for the tile, then its real size and
 * position are animated out to the centre. Width/height are animated rather
 * than a scale, because the tiles and the panel have different shapes and a
 * non-uniform scale would stretch the text.
 *
 * Desktop only (above 900px), matching the tiles' own breakpoint: below it
 * the tiles stack in one column and there is no room for the panel.
 *
 * MOUNT ORDER MATTERS: after the Awards and Services pins, and before every
 * trigger further down the page (Insights, Contact), because ScrollTrigger
 * only accounts for a pin when measuring triggers created after it.
 */

/** Scroll, in px (~100 per wheel notch), spent on each beat. */
const LEAD_PX = 120; // tiles alone on screen before the first zoom starts
const GROW_PX = 320;
const HOLD_PX = 180;
const SHRINK_PX = 280;
const GAP_PX = 80; // between one project going back and the next growing

/** The enlarged panel: its shape, and the most of the screen it may take. */
const PANEL_ASPECT = 16 / 9.5;
const PANEL_MAX_W = 0.86; // of viewport width
const PANEL_MAX_H = 0.8; // of viewport height
const PANEL_RADIUS = 24;

/** Where the artwork sits inside the enlarged panel's frame, in %. */
const MEDIA_INSET = { top: 11, right: 6, bottom: 13, left: 6 };
const MEDIA_RADIUS = 12;

export function FeaturedShowcase() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id?.startsWith("showcase-"))
      .forEach((instance) => instance.kill());

    const section = document.querySelector<HTMLElement>(".new-ui-featured");
    const grid = document.querySelector<HTMLElement>(".new-ui-featured-grid");
    const dim = document.querySelector<HTMLElement>(".new-ui-showcase-dim");
    const panels = gsap.utils.toArray<HTMLElement>(".new-ui-showcase-card");

    if (!section || !grid || !dim || panels.length === 0) return;

    const pairs = panels
      .map((panel) => ({
        panel,
        tile: section.querySelector<HTMLElement>(
          `.new-ui-featured-card[data-project="${panel.dataset.project}"]`
        ),
      }))
      .filter((pair): pair is { panel: HTMLElement; tile: HTMLElement } =>
        Boolean(pair.tile)
      );

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      // --- geometry, all in the section's own coordinates ------------------
      // Everything uses offsetLeft/offsetTop, which ignore transforms, so
      // neither the tiles' entrance animation nor the pin can skew them.

      const viewportW = () => document.documentElement.clientWidth;
      const viewportH = () => window.innerHeight;

      /** The section's position on screen while it is pinned. */
      const sectionScreenTop = () =>
        viewportH() / 2 - (offsetInSection(grid).y + grid.offsetHeight / 2);
      const sectionScreenLeft = () => {
        let left = 0;
        for (let el: HTMLElement | null = section; el; el = el.offsetParent as HTMLElement | null) {
          left += el.offsetLeft;
        }
        return left;
      };

      /**
       * An element's offset from the section, summed up the offsetParent
       * chain: each tile sits inside an absolutely placed slot inside a
       * positioned grid, so its own offsetLeft/Top is only relative to its
       * slot.
       */
      const offsetInSection = (el: HTMLElement) => {
        let x = 0;
        let y = 0;
        for (
          let node: HTMLElement | null = el;
          node && node !== section;
          node = node.offsetParent as HTMLElement | null
        ) {
          x += node.offsetLeft;
          y += node.offsetTop;
        }
        return { x, y };
      };

      const tileBox = (tile: HTMLElement) => ({
        ...offsetInSection(tile),
        width: tile.offsetWidth,
        height: tile.offsetHeight,
      });

      /**
       * The enlarged panel for a tile, placed at the same relative spot on
       * screen as the tile itself: with (u, v) the tile centre's position as
       * a fraction of the viewport, the panel's left edge sits at u of the
       * free width and its top at v of the free height. The growth then
       * pivots on a point inside the tile (exactly its centre for a tile in
       * the middle), so a tile on the left grows rightward, one on the right
       * grows leftward — it enlarges from where it sits — while the finished
       * panel always stays fully on screen.
       */
      const panelBox = (tile: HTMLElement) => {
        const vw = viewportW();
        const vh = viewportH();
        let width = Math.min(vw * PANEL_MAX_W, 1240);
        let height = width / PANEL_ASPECT;
        if (height > vh * PANEL_MAX_H) {
          height = vh * PANEL_MAX_H;
          width = height * PANEL_ASPECT;
        }
        const box = tileBox(tile);
        const clamp = gsap.utils.clamp(0, 1);
        const u = clamp((sectionScreenLeft() + box.x + box.width / 2) / vw);
        const v = clamp((sectionScreenTop() + box.y + box.height / 2) / vh);
        return {
          x: u * (vw - width) - sectionScreenLeft(),
          y: v * (vh - height) - sectionScreenTop(),
          width,
          height,
        };
      };

      /** Covers exactly the viewport while pinned. */
      const placeDim = () => {
        gsap.set(dim, {
          x: -sectionScreenLeft(),
          y: -sectionScreenTop(),
          width: viewportW(),
          height: viewportH(),
        });
      };

      /** Copy each tile's label styling onto its overlay's label. */
      const copyLabels = () => {
        pairs.forEach(({ panel, tile }) => {
          const label = panel.querySelector<HTMLElement>(".new-ui-showcase-label");
          const tileTitle = tile.querySelector("strong");
          const tileTag = tile.querySelector("span:not(.new-ui-featured-glow)");
          if (!label || !tileTitle || !tileTag) return;
          const tileStyle = getComputedStyle(tile);
          gsap.set(label, { padding: tileStyle.padding });
          gsap.set(label.querySelector("strong"), {
            fontSize: getComputedStyle(tileTitle).fontSize,
          });
          gsap.set(label.querySelector("span"), {
            fontSize: getComputedStyle(tileTag).fontSize,
          });
        });
      };

      placeDim();
      copyLabels();
      const onRefresh = () => {
        placeDim();
        copyLabels();
        syncTurns();
      };

      // --- the sequence ------------------------------------------------------

      const head = section.querySelector<HTMLElement>(".new-ui-featured-head");

      /**
       * How far the heading row (title + category list) is still on screen,
       * measured from the top, when the pin starts. While the tiles hold
       * still, the heading keeps travelling up 1:1 with the scroll by this
       * much, so it leaves the screen exactly as a normal scroll would carry
       * it off — and the zooms then play with only the projects on screen.
       */
      const headExit = () =>
        head
          ? Math.max(0, sectionScreenTop() + head.offsetTop + head.offsetHeight + 8)
          : 0;
      // Fixed when the timeline is built; a resize re-measures the distance
      // (function value below) and can only change its speed slightly.
      const exitPx = Math.round(headExit());
      const leadIn = exitPx + LEAD_PX;

      const turn = GROW_PX + HOLD_PX + SHRINK_PX;
      const total = leadIn + pairs.length * turn + (pairs.length - 1) * GAP_PX;

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "showcase-pin",
          trigger: grid,
          // The tile row is centred on screen when the pin starts.
          start: "center center",
          end: `+=${total}`,
          pin: section,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
        },
        // immediateRender off everywhere: each overlay has several tweens
        // (grow and shrink), and rendering their start values at build time
        // would leave it wherever the LAST one begins. The overlays are hidden
        // until their turn anyway.
        defaults: { ease: "none", immediateRender: false },
      });

      // Heading scrolls up and out while the tiles stay put.
      if (head && exitPx > 0) {
        tl.fromTo(head, { y: 0 }, { y: () => -headExit(), duration: exitPx }, 0);
      }

      const turns: {
        panel: HTMLElement;
        tile: HTMLElement;
        start: number;
        done: number;
      }[] = [];

      // Durations are scroll px, so each beat owns exactly its share.
      pairs.forEach(({ panel, tile }, index) => {
        const media = panel.querySelector<HTMLElement>(".new-ui-showcase-media");
        const label = panel.querySelector<HTMLElement>(".new-ui-showcase-label");
        const title = panel.querySelector<HTMLElement>(".new-ui-showcase-title");
        const meta = panel.querySelector<HTMLElement>(".new-ui-showcase-meta");

        const start = leadIn + index * (turn + GAP_PX);
        const shrinkAt = start + GROW_PX + HOLD_PX;
        const done = shrinkAt + SHRINK_PX;

        // Function-based so every refresh (e.g. a resize) re-measures them.
        const atTile = () => ({
          x: () => tileBox(tile).x,
          y: () => tileBox(tile).y,
          width: () => tileBox(tile).width,
          height: () => tileBox(tile).height,
          borderRadius: 0,
        });
        const atPanel = () => ({
          x: () => panelBox(tile).x,
          y: () => panelBox(tile).y,
          width: () => panelBox(tile).width,
          height: () => panelBox(tile).height,
          borderRadius: PANEL_RADIUS,
        });
        const mediaFull = {
          top: "0%",
          right: "0%",
          bottom: "0%",
          left: "0%",
          borderRadius: 0,
        };
        const mediaFramed = {
          top: `${MEDIA_INSET.top}%`,
          right: `${MEDIA_INSET.right}%`,
          bottom: `${MEDIA_INSET.bottom}%`,
          left: `${MEDIA_INSET.left}%`,
          borderRadius: MEDIA_RADIUS,
        };

        // Which of tile/overlay is showing is decided in syncTurns() below,
        // not by tweens.
        turns.push({ panel, tile, start, done });

        tl

          // GROW
          .fromTo(panel, atTile(), { ...atPanel(), duration: GROW_PX }, start)
          .fromTo(media, mediaFull, { ...mediaFramed, duration: GROW_PX }, start)
          .fromTo(dim, { opacity: 0 }, { opacity: 1, duration: GROW_PX * 0.6 }, start)
          .fromTo(label, { opacity: 1 }, { opacity: 0, duration: GROW_PX * 0.3 }, start)
          .fromTo(
            title,
            { opacity: 0, x: -60 },
            { opacity: 1, x: 0, duration: GROW_PX * 0.45 },
            start + GROW_PX * 0.55
          )
          .fromTo(
            meta,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: GROW_PX * 0.35 },
            start + GROW_PX * 0.65
          )

          // SHRINK — the same beats in reverse, back into the tile.
          .fromTo(
            title,
            { opacity: 1, x: 0 },
            { opacity: 0, x: -60, duration: SHRINK_PX * 0.35 },
            shrinkAt
          )
          .fromTo(
            meta,
            { opacity: 1, y: 0 },
            { opacity: 0, y: 30, duration: SHRINK_PX * 0.3 },
            shrinkAt
          )
          .fromTo(panel, atPanel(), { ...atTile(), duration: SHRINK_PX }, shrinkAt)
          .fromTo(media, mediaFramed, { ...mediaFull, duration: SHRINK_PX }, shrinkAt)
          .fromTo(
            dim,
            { opacity: 1 },
            { opacity: 0, duration: SHRINK_PX * 0.6 },
            shrinkAt + SHRINK_PX * 0.4
          )
          .fromTo(
            label,
            { opacity: 0 },
            { opacity: 1, duration: SHRINK_PX * 0.3 },
            shrinkAt + SHRINK_PX * 0.7
          )

          // Pads the timeline so its end lands exactly on `done`.
          .set({}, {}, done);
      });

      /**
       * Swap each tile for its overlay while (and only while) the playhead is
       * inside that project's turn. This used to be tweens on autoAlpha, but
       * a refresh (e.g. the one after web fonts load) re-renders the timeline
       * in a way that could leave a tile's visibility "hidden" before its
       * turn had even started — the tiles were invisible under the heading.
       * Deciding it from the playhead position each update can't get stuck.
       */
      const syncTurns = () => {
        const time = tl.time();
        turns.forEach(({ panel, tile, start, done }) => {
          const active = time >= start && time < done;
          tile.style.visibility = active ? "hidden" : "";
          panel.style.visibility = active ? "visible" : "";
          panel.style.opacity = active ? "1" : "";
        });
      };
      tl.eventCallback("onUpdate", syncTurns);
      syncTurns();

      // Registered only now: onRefresh calls syncTurns, which needs `tl`.
      ScrollTrigger.addEventListener("refresh", onRefresh);

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(
          [
            dim,
            ...pairs.flatMap(({ panel }) => [
              panel,
              ...panel.querySelectorAll<HTMLElement>(
                ".new-ui-showcase-media, .new-ui-showcase-label, .new-ui-showcase-label *, .new-ui-showcase-title, .new-ui-showcase-meta"
              ),
            ]),
          ],
          { clearProps: "all" }
        );
        // Only what this sequence touched: the tiles' transforms belong to
        // their entrance reveal.
        pairs.forEach(({ tile }) => {
          tile.style.visibility = "";
        });
        if (head) gsap.set(head, { clearProps: "transform" });
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return null;
}
