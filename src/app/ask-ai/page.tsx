import Link from "next/link";
import "@fontsource/lobster/latin-400.css";
import { BackgroundLines } from "../new-ui/_components/background-lines";
import { AiChat } from "./_components/ai-chat";

export const metadata = {
  title: "Ask AI — Aaryan Gupta",
};

/**
 * Ask AI, in the New UI's look: the dark teal backdrop with its glowing
 * lines, a greeting and title, Aaryan's photo in the middle, a pill-shaped
 * "Ask me anything" box and topic tiles underneath. Asking something turns
 * the middle into the conversation (see ai-chat.tsx). Fits one screen.
 */
export default function AskAiPage() {
  return (
    <main className="new-ui-page ask-ai-v2">
      <div className="new-ui-backdrop" aria-hidden="true">
        <span className="new-ui-glow" />
        <BackgroundLines />
      </div>

      <header className="ask-ai-bar">
        <Link className="nav-cta new-ui-back-cta" href="/new-ui">
          ← Back to portfolio
        </Link>
        <Link className="ask-ai-brand" href="/new-ui" aria-label="Aaryan Gupta, back to portfolio">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo */}
          <img className="new-ui-logo" src="/logo-a.png" alt="" />
        </Link>
      </header>

      <AiChat />
    </main>
  );
}
