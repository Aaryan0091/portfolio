"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Flag read by the portfolio's SmoothScroll: "put the visitor back where
 * they were", rather than at the link's #featured-work target. */
export const RETURN_FLAG = "new-ui-return";

/**
 * "← All projects": goes back to the portfolio and returns the visitor to
 * exactly where they left it (see smooth-scroll.tsx). If there is no saved
 * spot — e.g. they opened this project page directly — it lands on Featured
 * Work instead.
 */
export function ReturnLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      className={className}
      // No #hash: Next.js would scroll to it after arriving and override
      // the restored spot. The no-saved-spot fallback to Featured Work is
      // handled in smooth-scroll.tsx instead.
      href="/new-ui"
      // Next.js otherwise scrolls to the top after arriving, undoing the
      // restored spot.
      scroll={false}
      onClick={() => {
        try {
          sessionStorage.setItem(RETURN_FLAG, "1");
        } catch {
          // Storage unavailable — it simply lands on Featured Work.
        }
      }}
    >
      {children}
    </Link>
  );
}
