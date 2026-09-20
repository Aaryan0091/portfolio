"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function NewUiHeader() {
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 80) {
        setHidden(false);
        setRevealed(false);
      } else if (delta > 4) {
        setHidden(true);
      } else if (delta < -4) {
        setHidden(false);
        setRevealed(true);
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
