"use client";

import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
};

/** The photo in the middle of the page. Swap the file to change it. */
const PHOTO_SRC = "/profile/aaryan.webp";

type TopicIcon = "me" | "projects" | "skills" | "contact" | "location" | "resume";

const topics: Array<{ label: string; question: string; icon: TopicIcon }> = [
  { label: "Me", question: "Tell me about Aaryan.", icon: "me" },
  { label: "Projects", question: "What has Aaryan built?", icon: "projects" },
  { label: "Skills", question: "What is his tech stack?", icon: "skills" },
  { label: "Contact", question: "How can I contact Aaryan?", icon: "contact" },
  { label: "Location", question: "Where is Aaryan based?", icon: "location" },
  { label: "Resume", question: "Where can I find Aaryan's resume?", icon: "resume" },
];

/** Example questions the input's placeholder types out, erases, and cycles. */
const placeholderPrompts = [
  "Ask me anything…",
  "What has Aaryan built?",
  "Which technologies does he use?",
  "Tell me about SkillChain…",
  "What services does he offer?",
  "How can I contact Aaryan?",
];

const TYPE_MS = 32;
const ERASE_MS = 18;
const HOLD_MS = 1600;
const GAP_MS = 350;

/**
 * The input's placeholder, typed out a character at a time, held, erased,
 * then the next prompt — round and round. Reduced-motion users just get the
 * first prompt.
 */
function useTypedPlaceholder() {
  const [text, setText] = useState(placeholderPrompts[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let prompt = 0;
    let length = placeholderPrompts[0].length;
    let erasing = true;
    let timer = window.setTimeout(step, HOLD_MS);

    function step() {
      const current = placeholderPrompts[prompt];
      if (erasing) {
        length -= 1;
        if (length <= 0) {
          erasing = false;
          prompt = (prompt + 1) % placeholderPrompts.length;
          setText("");
          timer = window.setTimeout(step, GAP_MS);
          return;
        }
        setText(current.slice(0, length));
        timer = window.setTimeout(step, ERASE_MS);
      } else {
        length += 1;
        setText(current.slice(0, length));
        if (length >= current.length) {
          erasing = true;
          timer = window.setTimeout(step, HOLD_MS);
          return;
        }
        timer = window.setTimeout(step, TYPE_MS);
      }
    }

    return () => window.clearTimeout(timer);
  }, []);

  return text;
}


function TopicGlyph({ icon }: { icon: TopicIcon }) {
  const paths: Record<TopicIcon, ReactNode> = {
    me: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.5h.01M15 9.5h.01" />
      </>
    ),
    projects: (
      <>
        <rect x="3.5" y="7" width="17" height="12" rx="2.5" />
        <path d="M9 7V5.5h6V7M3.5 12h17" />
      </>
    ),
    skills: (
      <>
        <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
        <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
      </>
    ),
    contact: (
      <>
        <circle cx="10" cy="8" r="3.5" />
        <path d="M3.5 20c.6-3.6 3-5.5 6.5-5.5 1.3 0 2.4.3 3.4.8" />
        <circle cx="17.5" cy="17.5" r="2.5" />
        <path d="m19.4 19.4 1.6 1.6" />
      </>
    ),
    location: (
      <>
        <path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    resume: (
      <>
        <path d="M6.5 3h8l4 4v14h-12z" />
        <path d="M14.5 3v4h4M9.5 12h5M9.5 15.5h5" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[icon]}
    </svg>
  );
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [typing, setTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const chatting = messages.length > 0;

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const typedPlaceholder = useTypedPlaceholder();

  /**
   * Ask the model with conversation history. Failures are shown explicitly,
   * never replaced with scripted biographical answers.
   */
  const ask = async (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed || typing) return;

    const conversation: Message[] = [...messages, { role: "user", text: trimmed }];
    setMessages(conversation);
    setQuestion("");
    setTyping(true);

    const reply = (text: string, isError = false) => {
      setMessages((current) => [...current, { role: "assistant", text, isError }]);
      setTyping(false);
    };

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.filter((message) => !message.isError) }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        answer?: string;
        error?: string;
      };
      if (response.ok && data.answer) {
        reply(data.answer);
      } else {
        reply(
          response.status === 429 && data.error
            ? data.error
            : "The AI is unavailable right now. Please try your question again in a moment.",
          true
        );
      }
    } catch {
      reply("Couldn't reach the AI. Please check your connection and try again.", true);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  return (
    <div className={`ask-ai-stage${chatting ? " is-chatting" : ""}`}>
      <div className="ask-ai-hero">
        <p className="ask-ai-greeting">
          Hey, I&apos;m Aaryan
        </p>
        <h1 className="ask-ai-heading">Full-Stack Engineer — AI/NLP</h1>
      </div>

      {/* The photo: large in the middle until the first question, then a
          small avatar above the conversation. */}
      <div className="ask-ai-photo">
        <span className="ask-ai-photo-glow" aria-hidden="true" />
        <span className="ask-ai-photo-frame">
          <Image
            src={PHOTO_SRC}
            alt="Aaryan Gupta"
            fill
            sizes="(max-width: 600px) 60vw, 320px"
            loading="eager"
            fetchPriority="high"
          />
        </span>
      </div>

      {chatting && (
        <div className="ask-ai-log" ref={logRef} aria-live="polite">
          {messages.map((message, index) => (
            <div className={`ask-ai-row ask-ai-row-${message.role}`} key={index}>
              <div className={`ask-ai-bubble ask-ai-bubble-${message.role}`}>
                {message.isError && <strong>Unable to answer</strong>}
                {message.role === "assistant" ? (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml
                    components={{
                      img: () => null,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          {...(/^https?:\/\//i.test(href ?? "") || href?.endsWith(".pdf")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.text}
                  </Markdown>
                ) : message.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="ask-ai-row ask-ai-row-assistant">
              <div className="ask-ai-bubble ask-ai-bubble-assistant ask-ai-typing">
                <span className="sr-only">Typing…</span>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
      )}

      <form className="ask-ai-form" onSubmit={handleSubmit}>
        <label htmlFor="ask-ai-input" className="sr-only">
          Ask me anything
        </label>
        <input
          id="ask-ai-input"
          type="text"
          placeholder={typedPlaceholder}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!question.trim() || typing}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      <div className="ask-ai-topics">
        {topics.map((topic) => (
          <button
            type="button"
            onClick={() => void ask(topic.question)}
            disabled={typing}
            key={topic.label}
          >
            <TopicGlyph icon={topic.icon} />
            <span>{topic.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
