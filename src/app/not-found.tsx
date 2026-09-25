import Link from "next/link";
// The New UI's script face, for the big "404" and the title.
import "@fontsource/lobster/latin-400.css";
import { BackgroundLines } from "./new-ui/_components/background-lines";

/**
 * 404 page, dressed in the New UI's look: the same dark teal, the same
 * vertical lines with light streaks running along them, and the Lobster
 * script for the big "404". `new-ui-root` brings in the New UI palette and
 * button styles.
 */
export default function NotFound() {
  return (
    <main className="new-ui-root nf-page">
      <div className="nf-backdrop" aria-hidden="true">
        <span className="nf-glow" />
        <BackgroundLines pulsesPerLine={2} />
      </div>

      <div className="nf-content">
        <p className="nf-kicker">Error 404 · Page not found</p>
        <p className="nf-code" aria-hidden="true">
          404
        </p>
        <h1 className="nf-title">Lost in the scroll</h1>
        <p className="nf-text">
          This page doesn&apos;t exist or has moved. Let&apos;s get you back to
          the good stuff.
        </p>
        <div className="nf-actions">
          <Link className="new-ui-primary" href="/new-ui">
            Back to the portfolio
          </Link>
          <Link className="new-ui-secondary" href="/gallery">
            Explore the gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
