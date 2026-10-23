"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * sessionStorage key read by the portfolio's SmoothScroll (smooth-scroll.tsx).
 * Its value says where to land if there's no saved spot: a section hash like
 * "#featured-work", or "top".
 */
export const RETURN_FLAG = "new-ui-return";

/**
 * A link back to the portfolio (/new-ui) that returns the visitor to exactly
 * where they left it — like the browser's Back button — instead of the top.
 * Used by every "Back to portfolio" link and logo on the other pages.
 *
 * `fallback` is where to land if there is no saved spot (e.g. the visitor
 * opened this page directly): a section hash, or the top by default.
 */
export function ReturnLink({
  className,
  children,
  fallback = "top",
  ...rest
}: {
  className?: string;
  children: ReactNode;
  fallback?: string;
  "aria-label"?: string;
}) {
  return (
    <Link
      {...rest}
      className={className}
      // No #hash in the URL: Next.js would scroll to it after arriving and
      // override the restored spot. The fallback travels in the flag instead.
      href="/new-ui"
      // Next.js otherwise scrolls to the top after arriving.
      scroll={false}
      onClick={() => {
        try {
          sessionStorage.setItem(RETURN_FLAG, fallback);
        } catch {
          // Storage unavailable — the page simply starts at the top.
        }
      }}
    >
      {children}
    </Link>
  );
}
