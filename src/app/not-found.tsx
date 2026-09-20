import Link from "next/link";

export default function NotFound() {
  return (
    <main className="legal-page not-found-page">
      <div className="legal-content not-found-content">
        <p className="kicker">404</p>
        <h1>Page not found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link className="legal-cta" href="/new-ui">
          Back to the site
        </Link>
      </div>
    </main>
  );
}
