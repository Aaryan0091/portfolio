"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function NewUiHeader() {
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll()
      .filter((instance) => instance.vars.id === "new-ui-header")
      .forEach((instance) => instance.kill());

    // Fine as a one-off baseline: at mount the smoother has not had a chance
    // to diverge from the native position yet. Every reading after this comes
    // from ScrollTrigger.
    lastScrollY.current = window.scrollY;

    // Driven by ScrollTrigger rather than a raw `scroll` listener on purpose.
    // ScrollSmoother renders the page at a position that lags behind
    // `window.scrollY`, and `normalizeScroll` intercepts wheel and touch
    // before the browser emits its own scroll events — so reading
    // `window.scrollY` here left the header stuck hidden. ScrollTrigger
    // reports the position the user is actually looking at, with or without
    // the smoother running.
    const instance = ScrollTrigger.create({
      id: "new-ui-header",
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const currentY = self.scroll();
        const delta = currentY - lastScrollY.current;

        if (currentY < 80) {
          setHidden(false);
          setRevealed(false);
          lastScrollY.current = currentY;
          return;
        }

        // Only reset the baseline when a threshold actually fires — small
        // scroll-wheel ticks below the threshold accumulate against the same
        // baseline instead of each one resetting it, so a few small nudges in
        // the same direction still add up to a trigger, not just one big flick.
        if (delta > 2) {
          setHidden(true);
          lastScrollY.current = currentY;
        } else if (delta < -2) {
          setHidden(false);
          setRevealed(true);
          lastScrollY.current = currentY;
        }
      },
    });

    return () => instance.kill();
  }, []);

  return (
    <header
      className={`site-header new-ui-header${hidden ? " new-ui-header-hidden" : ""}${revealed ? " new-ui-header-revealed" : ""}`}
    >
      <div className="nav-shell">
        <nav aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <a href="#services">Services</a>
          <a href="#portfolio">Portfolio</a>
          <Link className="ask-ai-nav-link" href="/ask-ai">
            Ask AI
          </Link>
        </nav>

        <Link className="brand" href="/" aria-label="Aaryan Gupta, home">
          <span className="brand-symbol">AG</span>
        </Link>

        <div className="nav-actions">
          <Link className="nav-cta new-ui-back-cta" href="/">
            Old UI
          </Link>
          <a className="nav-cta new-ui-cta" href="mailto:aaryangupta2005@gmail.com">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
