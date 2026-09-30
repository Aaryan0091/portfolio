import Link from "next/link";
import "@fontsource/lobster/latin-400.css";
import { BackgroundLines } from "../new-ui/_components/background-lines";
import { AiChat } from "./_components/ai-chat";

export const metadata = {
  title: "Ask AI — Aaryan Gupta",
};

/**
 * Ask AI, in the New UI's look: the dark teal backdrop with its glowing
 * lines, a Lobster heading, and the chat in a glass card with sky-blue
 * accents.
 */
export default function AskAiPage() {
  return (
    <main className="new-ui-page ask-ai-v2">
      <div className="new-ui-backdrop" aria-hidden="true">
        <span className="new-ui-glow" />
        <BackgroundLines />
      </div>

      <header className="ask-ai-bar">
        <Link className="ask-ai-brand" href="/new-ui" aria-label="Aaryan Gupta, back to portfolio">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo */}
          <img className="new-ui-logo" src="/logo-emblem.png" alt="" />
        </Link>
        <Link className="nav-cta new-ui-back-cta" href="/new-ui">
          ← Back to portfolio
        </Link>
      </header>

      <section className="ask-ai-hero">
        <p className="ask-ai-eyebrow">Ask AI</p>
        <h1 className="ask-ai-heading">Ask about Aaryan</h1>
        <p className="ask-ai-intro">
          Projects, skills, services, education or how to get in touch — ask
          anything and get a short answer straight from the portfolio.
        </p>
      </section>

      <AiChat />
    </main>
  );
}
