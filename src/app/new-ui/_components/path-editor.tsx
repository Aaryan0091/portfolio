"use client";

import { useEffect } from "react";

/**
 * Dev-only rig for drawing motion paths by hand.
 *
 * Visit /new-ui?path-editor=1 and GSAP's MotionPathHelper overlays a draggable
 * bezier editor on each target: drag the anchors and control handles around the
 * live page, then hit the little "copy" button on the overlay to get the path
 * values. Paste those into `heroExitPath` / `aboutEntryPath` in
 * portrait-scroll-link.tsx, or into the `path` prop of a <MotionPathReveal />.
 *
 * The plugins are imported dynamically so none of this lands in the normal
 * page bundle — nothing is fetched unless the query param is present.
 */

const editorTargets = [
  ".new-ui-portrait",
  ".new-ui-about-portrait",
  ".new-ui-featured-card",
];

export function PathEditor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!new URLSearchParams(window.location.search).has("path-editor")) return;

    let disposed = false;

    (async () => {
      const [{ default: gsap }, { MotionPathPlugin }, { MotionPathHelper }] =
        await Promise.all([
          import("gsap"),
          import("gsap/MotionPathPlugin"),
          import("gsap/MotionPathHelper"),
        ]);

      if (disposed) return;

      gsap.registerPlugin(MotionPathPlugin, MotionPathHelper);

      editorTargets
        .flatMap((selector) =>
          Array.from(document.querySelectorAll<HTMLElement>(selector))
        )
        .forEach((element) => {
          MotionPathHelper.create(element);
        });

      console.info(
        "[path-editor] MotionPathHelper active. Drag the handles, then use the overlay's copy button to grab the path."
      );
    })();

    return () => {
      disposed = true;
    };
  }, []);

  return null;
}
