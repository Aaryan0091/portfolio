import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Aaryan Gupta",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/new-ui">
        ← Back
      </Link>

      <div className="legal-content">
        <p className="kicker">Privacy Policy</p>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 2026</p>

        <p>
          This is a personal portfolio site. It doesn&apos;t run ads, sell
          data, or use third-party tracking scripts.
        </p>

        <h2>What this site collects</h2>
        <p>
          The contact form on this site opens your email client with a
          pre-filled message addressed to me — the name, email, and message
          you type are sent directly through your own email provider, not
          stored on this site or any server I control.
        </p>

        <h2>LeetCode activity</h2>
        <p>
          The coding activity shown on this site is fetched live from the
          public LeetCode API at request time and isn&apos;t stored anywhere.
        </p>

        <h2>Cookies</h2>
        <p>
          This site uses a single browser-storage entry to remember your
          light/dark theme preference. No analytics or advertising cookies
          are set.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <a href="mailto:aaryangupta2005@gmail.com">
            aaryangupta2005@gmail.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
