import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions — Aaryan Gupta",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/new-ui">
        ← Back
      </Link>

      <div className="legal-content">
        <p className="kicker">Terms and Conditions</p>
        <h1>Terms and Conditions</h1>
        <p className="legal-updated">Last updated: 2026</p>

        <p>
          This site is a personal portfolio belonging to Aaryan Gupta. By
          browsing it, you agree to the following terms.
        </p>

        <h2>Content</h2>
        <p>
          Project descriptions, writing, and code samples on this site are
          shared for informational purposes. Unless stated otherwise, they
          reflect my own work.
        </p>

        <h2>External links</h2>
        <p>
          Links to GitHub, LinkedIn, LeetCode, and other third-party services
          are provided for convenience. I&apos;m not responsible for the
          content or availability of those external sites.
        </p>

        <h2>No warranty</h2>
        <p>
          This site is provided as-is, without warranty of any kind. I make
          reasonable efforts to keep it accurate and up to date, but I can&apos;t
          guarantee it will always be error-free.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:aaryangupta2005@gmail.com">
            aaryangupta2005@gmail.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
