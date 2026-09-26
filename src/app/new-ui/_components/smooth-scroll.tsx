"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

/**
 * Wraps the page in the #smooth-wrapper / #smooth-content pair ScrollSmoother
 * requires, and adds momentum to the whole page's scrolling.
 *
 * Anything `position: fixed` must be rendered OUTSIDE this component. The
 * smoother animates a transform on #smooth-content, and a transformed ancestor
 * becomes the containing block for fixed descendants — so a fixed header
 * placed inside here would scroll away with the content instead of staying put.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
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
        if (target) {
          smoother.scrollTo(target, true, `top ${navHeight + 16}px`);
        } else if (href === "#top") {
          smoother.scrollTo(0, true);
        }
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
        sessionStorage.setItem(storageKey, String(Math.round(window.scrollY)));
      } catch {
        // Storage can be unavailable (private mode, quotas) — just skip.
      }
    };
    window.addEventListener("pagehide", savePosition);

    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReturnVisit =
      navigation?.type === "reload" || navigation?.type === "back_forward";
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
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true })
          );
    Promise.all([document.fonts?.ready, pageLoaded]).then(() => {
      if (disposed) return;
      ScrollTrigger.refresh();
      if (isReturnVisit && savedPosition > 0) {
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.scrollTo(savedPosition, false);
        else window.scrollTo(0, savedPosition);
        ScrollTrigger.update();
      }
    });

    return () => {
      disposed = true;
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
