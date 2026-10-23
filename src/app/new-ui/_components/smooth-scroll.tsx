"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { RETURN_FLAG } from "./return-link";

/**
 * Wraps the page in the #smooth-wrapper / #smooth-content pair ScrollSmoother
 * requires, and adds momentum to the whole page's scrolling.
 *
 * Anything `position: fixed` must be rendered OUTSIDE this component. The
 * smoother animates a transform on #smooth-content, and a transformed ancestor
 * becomes the containing block for fixed descendants — so a fixed header
 * placed inside here would scroll away with the content instead of staying put.
 */
/** False until SmoothScroll first mounts in this document; later mounts are
 * client-side arrivals from another page. */
let hasMountedInDocument = false;

/**
 * When the browser's Back/Forward last fired (popstate). Client-side "Back"
 * from a project page remounts this page without a fresh navigation entry,
 * so this is how a back-arrival is told apart from a normal link arrival.
 */
let lastPopStateAt = -Infinity;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopStateAt = performance.now();
  });
}
const isBackArrival = () => performance.now() - lastPopStateAt < 3000;

/**
 * Set by every "Back to portfolio" link on the other pages (ReturnLink in
 * return-link.tsx): return the visitor to where they left the portfolio,
 * like Back does. Its value is where to land if there's no saved spot — a
 * section hash ("#featured-work") or "top". null when not returning.
 */
const readReturnFlag = (): string | null => {
  try {
    return sessionStorage.getItem(RETURN_FLAG);
  } catch {
    return null;
  }
};

/** Hides the page while a back-arrival's position is restored, so it
 * appears already in place instead of showing the top and gliding down. */
const RESTORING_CLASS = "new-ui-restoring";

export function SmoothScroll({ children }: { children: ReactNode }) {
  // Before the first paint: coming back via Back, hide the content until it
  // has been put back where the visitor left it (removed in the effect below).
  useLayoutEffect(() => {
    // Returning via a "Back to portfolio" link (flag set) — even when this
    // is the first mount in the document, e.g. coming from the 404 page,
    // which is a full page load — or via the browser's Back within the app.
    const clientReturn =
      readReturnFlag() !== null || (hasMountedInDocument && isBackArrival());
    // A full page load from Back/Forward or a reload also restores the spot
    // (see below), so it is hidden for that moment too.
    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const reloadedHere =
      !hasMountedInDocument &&
      (navigation?.type === "reload" || navigation?.type === "back_forward") &&
      new URL(navigation.name).pathname === window.location.pathname;
    if (clientReturn || reloadedHere) {
      document.documentElement.classList.add(RESTORING_CLASS);
    }
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Dev-only console handles, so animations can be inspected and stepped
    // from devtools: `ScrollTrigger.getAll()`, `.animation.progress(0.5)`, etc.
    // Stripped from production builds by the NODE_ENV check.
    if (process.env.NODE_ENV === "development") {
      Object.assign(window, { gsap, ScrollTrigger, ScrollSmoother });
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The browser's own `scroll-behavior: smooth` and ScrollSmoother both
      // want to own the scroll position, and they visibly fight over anchor
      // jumps. Native gets switched off for as long as the smoother is alive.
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";

      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        // Seconds the content takes to "catch up" to the real scroll position.
        // ~1.2 reads as weighty without feeling laggy or seasick.
        smooth: 1.2,
        // Scroll sensitivity: each wheel notch or swipe moves the page 2/3 as
        // far as normal, so getting anywhere takes ~1.5x the scrolling.
        speed: 1 / 1.5,
        smoothTouch: 0.1,
        // Opts every `data-speed` / `data-lag` attribute on the page into
        // parallax without needing a ScrollTrigger of its own.
        effects: true,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });

      // A browser will scroll an `overflow: hidden` container to bring an
      // anchor target (or a focused element) into view — and #smooth-wrapper
      // is exactly such a container. Left alone, clicking `href="#services"`
      // silently scrolls the wrapper's own overflow box while the smoother
      // still reports 0, which offsets the page and invalidates every
      // ScrollTrigger measurement on it. So: handle hash links ourselves, and
      // pin the wrapper's own scrollTop at 0 no matter what moves it.
      const wrapper = document.querySelector<HTMLElement>("#smooth-wrapper");
      const navHeight =
        parseInt(
          getComputedStyle(root).getPropertyValue("--nav-height").trim(),
          10
        ) || 80;

      const handleAnchorClick = (event: MouseEvent) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const anchor = (event.target as HTMLElement | null)?.closest?.("a");
        const href = anchor?.getAttribute("href");
        if (!href || !href.startsWith("#") || href === "#") return;

        // Always swallow the default, even when the target is missing —
        // otherwise the browser falls back to scrolling the wrapper.
        event.preventDefault();

        const target = document.querySelector(href);
        let destination: number;
        if (target) {
          // Targets that fit on screen (like the "Got an Idea?" card) land
          // centred, with background showing above and below. Taller ones
          // land just under the header.
          const fits =
            target.getBoundingClientRect().height < window.innerHeight;
          destination = smoother.offset(
            target,
            fits ? "center center" : `top ${navHeight + 16}px`
          );
        } else if (href === "#top") {
          destination = 0;
        } else {
          return;
        }

        // A visible glide rather than a jump: the scroll position is tweened
        // with an ease-in-out, taking longer for longer trips (0.9–2.2s) so
        // even a jump across the whole page reads as one fast, smooth sweep.
        const distance = Math.abs(destination - smoother.scrollTop());
        const glide = gsap.to(smoother, {
          scrollTop: destination,
          duration: gsap.utils.clamp(0.9, 2.2, 0.6 + distance / 4000),
          ease: "power3.inOut",
          overwrite: true,
          onComplete: () => stopOnInput(false),
        });

        // Scrolling by hand mid-glide hands control straight back.
        const cancel = () => {
          glide.kill();
          stopOnInput(false);
        };
        const stopOnInput = (listen: boolean) => {
          const method = listen ? "addEventListener" : "removeEventListener";
          window[method]("wheel", cancel);
          window[method]("touchstart", cancel);
          window[method]("keydown", cancel);
        };
        stopOnInput(true);
      };

      const pinWrapper = () => {
        if (wrapper && wrapper.scrollTop !== 0) wrapper.scrollTop = 0;
      };

      document.addEventListener("click", handleAnchorClick);
      wrapper?.addEventListener("scroll", pinWrapper, { passive: true });

      return () => {
        document.removeEventListener("click", handleAnchorClick);
        wrapper?.removeEventListener("scroll", pinWrapper);
        smoother.kill();
        root.style.scrollBehavior = previousBehavior;
      };
    });

    // --- Keep your place on reload ------------------------------------------
    // The browser restores the scroll position the instant the page loads —
    // before the pinned sections (Awards, Services, Featured Work) have added
    // their extra scroll length. The page is thousands of px shorter at that
    // moment, so anything below the pins got clamped: reloading on Insights
    // or Contact dropped you back around the Featured Work projects.
    //
    // So restoration is done by hand: the position is saved when the page is
    // left, and put back only after everything has been measured. Only on a
    // reload or back/forward — a fresh visit still starts at the top.
    const storageKey = `scroll:${window.location.pathname}`;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const savePosition = () => {
      try {
        // In the smoother's own units when it's running: with `speed` below
        // 1 the window scrolls further than the page moves, and the position
        // is restored through the smoother below.
        const position =
          ScrollSmoother.get()?.scrollTop() ?? window.scrollY;
        sessionStorage.setItem(storageKey, String(Math.round(position)));
      } catch {
        // Storage can be unavailable (private mode, quotas) — just skip.
      }
    };
    window.addEventListener("pagehide", savePosition);
    // Client-side navigation to another page of the site fires no pagehide,
    // and by the time this component unmounts the scroll has already been
    // reset. So save whenever scrolling settles, and at the click that
    // leaves (capture phase, before the router acts).
    ScrollTrigger.addEventListener("scrollEnd", savePosition);
    const saveOnLeave = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (href && !href.startsWith("#")) savePosition();
    };
    document.addEventListener("click", saveOnLeave, true);

    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReturnVisit =
      navigation?.type === "reload" || navigation?.type === "back_forward";
    // Arriving from another page in the app (e.g. the old UI's link here) is
    // a client-side navigation: the window keeps the previous page's scroll
    // position, which dropped visitors near the bottom of this page. The
    // navigation entry above describes the document's first load, not this
    // arrival, so only trust it when the document was loaded on this page and
    // this is its first mount here.
    const loadedHere =
      !!navigation &&
      new URL(navigation.name).pathname === window.location.pathname;
    const isClientArrival = hasMountedInDocument || !loadedHere;
    hasMountedInDocument = true;
    // Restore the saved spot on a reload / browser back-forward of this
    // document, AND when coming back here with Back from another page of
    // the site (e.g. a project page) — the visitor returns to exactly where
    // they left, not the top.
    const returnFlag = isClientArrival ? readReturnFlag() : null;
    const returning = returnFlag !== null;
    // Cleared once the spot has been restored (below), not here: in
    // development React runs this effect twice, and clearing it on the first
    // run left the second one thinking this was an ordinary arrival.
    const clearReturnFlag = () => {
      try {
        sessionStorage.removeItem(RETURN_FLAG);
      } catch {
        // ignore
      }
    };
    const restore =
      (isReturnVisit && !isClientArrival) ||
      (isClientArrival && (isBackArrival() || returning));
    const reveal = () =>
      document.documentElement.classList.remove(RESTORING_CLASS);
    // Never leave the page hidden, whatever happens below.
    const revealTimer = window.setTimeout(reveal, 2500);

    /**
     * Puts the page at `position` and keeps it there, still hidden, until it
     * has stayed put for a few frames — then shows it. Right after arriving,
     * late layout re-measures (pins, images, fonts) can reset the scroll to
     * near the top, after which the smoother glided back down in plain view:
     * the "scrolling down to where I was" effect. Re-applying the position
     * and only revealing once the content is steady means the page appears
     * already in place.
     */
    const jumpTo = (position: number) => {
      const smoother = ScrollSmoother.get();
      if (smoother) {
        smoother.scrollTo(position, false);
        // Jumping moves the content but not the smoother's own scroll
        // animation, which still sits near the top after the arrival's
        // layout re-measures. On its next update it replayed from there and
        // glided down in plain view. Syncing it to the new spot (and
        // cancelling any catch-up in flight) keeps the content right here.
        const main = smoother.scrollTrigger;
        smoother.paused(true);
        smoother.paused(false);
        main?.animation?.progress(main.progress);
      } else {
        window.scrollTo(0, position);
      }
      ScrollTrigger.update();
    };
    /**
     * For a moment after the restored page appears, ScrollSmoother can still
     * relaunch its catch-up animation from a stale spot near the top (left
     * over from the arrival's layout re-measures) and glide down. While the
     * visitor hasn't scrolled themselves, any such catch-up is finished
     * instantly — the content never leaves the spot on screen.
     */
    const guardAfterReveal = (position: number) => {
      const smoother = ScrollSmoother.get();
      if (!smoother) return;
      const nativeY = window.scrollY;
      const until = performance.now() + 1200;
      // Runs inside GSAP's own tick, right after it renders and before the
      // browser paints — so a stray catch-up is undone in the same frame
      // and never reaches the screen.
      const guard = () => {
        // Stop after a moment, or as soon as the visitor scrolls (their own
        // smoothing is theirs to keep).
        if (
          disposed ||
          performance.now() > until ||
          Math.abs(window.scrollY - nativeY) > 2
        ) {
          gsap.ticker.remove(guard);
          return;
        }
        const tween = smoother.scrollTrigger?.getTween?.();
        if (tween?.isActive() && Math.abs(smoother.scrollTop() - position) > 2) {
          tween.progress(1);
          smoother.scrollTo(position, false);
        }
      };
      gsap.ticker.add(guard);
      removeGuard = () => gsap.ticker.remove(guard);
    };
    let removeGuard = () => {};

    let holdFrame = 0;
    const holdAt = (position: number) => {
      const started = performance.now();
      let steadyFrames = 0;
      const tick = () => {
        if (disposed) return;
        const smoother = ScrollSmoother.get();
        if (!smoother) {
          window.scrollTo(0, position);
          reveal();
          return;
        }
        if (Math.abs(smoother.scrollTop() - position) > 2) {
          jumpTo(position);
          steadyFrames = 0;
        }
        // The content's actual on-screen offset, which lags the scroll
        // position while the smoother eases.
        const content = document.getElementById("smooth-content");
        const transform = content ? getComputedStyle(content).transform : "none";
        const offset =
          transform && transform !== "none" ? -new DOMMatrix(transform).m42 : 0;
        steadyFrames =
          Math.abs(offset - smoother.scrollTop()) < 3 ? steadyFrames + 1 : 0;
        if (steadyFrames >= 6 || performance.now() - started > 2000) {
          reveal();
          guardAfterReveal(position);
          return;
        }
        holdFrame = requestAnimationFrame(tick);
      };
      jumpTo(position);
      holdFrame = requestAnimationFrame(tick);
    };
    const startAtTop = !restore && !window.location.hash;
    const scrollToTop = () => {
      ScrollSmoother.get()?.scrollTo(0, false);
      window.scrollTo(0, 0);
    };
    if (startAtTop) scrollToTop();
    let savedPosition = 0;
    try {
      savedPosition = Number(sessionStorage.getItem(storageKey)) || 0;
    } catch {
      savedPosition = 0;
    }

    // Re-measure every trigger once the web fonts are in and the page has
    // loaded. The headings use Lobster, which is wider and taller than the
    // fallback: if it lands after ScrollTrigger has measured, every heading
    // above a section changes height and all the scroll positions below
    // drift — which showed up as Featured Work's tiles still invisible while
    // they were on screen. The saved position is restored right after, when
    // the page has its full, final length.
    let disposed = false;
    /** Header height plus a little air — where a section's top lands. */
    const navHeightPx = () =>
      (parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--nav-height")
          .trim(),
        10
      ) || 80) + 16;
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true })
          );
    Promise.all([document.fonts?.ready, pageLoaded]).then(() => {
      if (disposed) return;
      ScrollTrigger.refresh();
      if (startAtTop) {
        scrollToTop();
        ScrollTrigger.update();
      } else if (restore && savedPosition > 0) {
        holdAt(savedPosition);
        clearReturnFlag();
        return; // holdAt reveals the page itself, once it's settled.
      } else if (
        window.location.hash ||
        (returning && returnFlag?.startsWith("#"))
      ) {
        // Arriving with a section in the URL — or returning via a "Back to
        // portfolio" link with no saved spot, whose fallback is a section
        // (e.g. "← All projects" → Featured Work): go to that section. The
        // browser can't do it itself — the smoother owns the scrolling.
        const smoother = ScrollSmoother.get();
        const target = document.querySelector(
          window.location.hash || returnFlag || ""
        );
        if (smoother && target) {
          smoother.scrollTo(target, false, `top ${navHeightPx()}px`);
          ScrollTrigger.update();
        }
      } else if (returning) {
        // Returning with no saved spot and no section to go to: the top.
        scrollToTop();
        ScrollTrigger.update();
      }
      clearReturnFlag();
      // Show the page once it's in place (next frame, so the jump has been
      // rendered and nothing glides into view).
      requestAnimationFrame(reveal);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(holdFrame);
      removeGuard();
      ScrollTrigger.removeEventListener("scrollEnd", savePosition);
      document.removeEventListener("click", saveOnLeave, true);
      window.clearTimeout(revealTimer);
      reveal();
      window.removeEventListener("pagehide", savePosition);
      window.history.scrollRestoration = previousRestoration;
      mm.revert();
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
