import Link from "next/link";
import { AboutAssistant } from "../_components/about-assistant";
import { AskAiFooter } from "./_components/ask-ai-footer";

export const metadata = {
  title: "Ask AI — Aaryan Gupta",
};

export default function AskAiPage() {
  return (
    <main className="ask-ai-page">
      <Link className="ask-ai-persistent-back" href="/new-ui">
        ← Back to portfolio
      </Link>

      <AboutAssistant />

      <AskAiFooter />
    </main>
  );
}
