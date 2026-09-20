"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AskAiFooter() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 40);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className={`ask-ai-footer${visible ? " ask-ai-footer-visible" : ""}`}>
      <Link className="ask-ai-footer-back" href="/new-ui">
        ← Back
      </Link>
      <span className="brand-symbol">AG</span>
      <span className="ask-ai-footer-spacer" aria-hidden="true" />
    </footer>
  );
}
