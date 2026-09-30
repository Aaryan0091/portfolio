"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const suggestedPrompts = [
  "Tell me about Aaryan.",
  "What has Aaryan built?",
  "What is his tech stack?",
  "What services does he offer?",
  "Tell me about his LeetCode practice.",
  "How can I contact Aaryan?",
];

const introMessage: Message = {
  role: "assistant",
  text: "Hi! Ask me about Aaryan's projects, technical skills, services, education, or problem-solving practice. I'll keep answers grounded in what's actually on his portfolio.",
};

/** How long the assistant "types" before its answer appears. */
const REPLY_DELAY_MS = 650;

function answerQuestion(question: string) {
  const normalized = question.toLowerCase();

  if (/service|offer|hire for|help with/.test(normalized)) {
    return "Aaryan offers web app development, frontend engineering, backend development, AI feature integration, blockchain development, deployment & DevOps, and database management.";
  }

  if (/project|built|build|work|portfolio/.test(normalized)) {
    return "Aaryan has shipped five projects, including SkillChain, Work-Stack, and Soul-Voyage — spanning AI/NLP, blockchain verification, browser tooling, semantic search, and real-time web experiences.";
  }

  if (/stack|skill|technology|technologies|tool/.test(normalized)) {
    return "His core stack is TypeScript, React, Next.js, Node.js, Python, and PostgreSQL, alongside Express, MongoDB, Supabase, Firebase, and NLP/ML tooling.";
  }

  if (/strength|good at|special|focus/.test(normalized)) {
    return "His strength is connecting the full product: thoughtful interfaces, reliable APIs and data, authentication, real-time features, and useful AI capabilities.";
  }

  if (/education|college|university|student|degree/.test(normalized)) {
    return "Aaryan is pursuing a B.Tech in Computer Science (AI & ML) at Manipal University Jaipur, from 2023 to the present.";
  }

  if (/resume|résumé|cv/.test(normalized)) {
    return "You can open Aaryan's résumé from the main site, alongside his GitHub, LinkedIn, and LeetCode links.";
  }

  if (/leetcode|problem|dsa|algorithm/.test(normalized)) {
    return "He practices data structures and algorithms consistently on LeetCode, with his solved totals and activity on the main portfolio.";
  }

  if (/contact|email|reach|hire|connect/.test(normalized)) {
    return "Use the \"Got an Idea?\" form at the bottom of the portfolio, or email aaryangupta2005@gmail.com. He's also on GitHub and LinkedIn.";
  }

  if (/ai|machine learning|ml|nlp/.test(normalized)) {
    return "Aaryan works with machine learning, deep learning, NLP, TensorFlow, scikit-learn, spaCy, and NLTK, applying them to practical product workflows like SkillChain.";
  }

  if (/hackathon|award|experience|credential/.test(normalized)) {
    return "He participated in the internal round of Smart India Hackathon 2024 at Manipal University Jaipur, and holds certifications from NPTEL/IIT Madras, Oracle Academy, Red Hat Academy, and Cisco + CodeChef.";
  }

  return "I can best answer questions about Aaryan's projects, skills, services, education, LeetCode practice, awards, or how to contact him.";
}

function AssistantAvatar() {
  return (
    <span className="ai-chat-avatar" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo */}
      <img src="/logo-emblem.png" alt="" />
    </span>
  );
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([introMessage]);
  const [question, setQuestion] = useState("");
  const [typing, setTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<number>(0);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  const ask = (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed || typing) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setQuestion("");
    setTyping(true);
    replyTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: answerQuestion(trimmed) },
      ]);
      setTyping(false);
    }, REPLY_DELAY_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-head">
        <AssistantAvatar />
        <div>
          <strong>Aaryan&apos;s assistant</strong>
          <span>
            <span className="ai-chat-status-dot" aria-hidden="true" /> Online
          </span>
        </div>
      </div>

      <div className="ai-chat-log" ref={logRef} aria-live="polite">
        {messages.map((message, index) => (
          <div
            className={`ai-chat-row ai-chat-row-${message.role}`}
            key={index}
          >
            {message.role === "assistant" && <AssistantAvatar />}
            <div className={`ai-chat-bubble ai-chat-bubble-${message.role}`}>
              {message.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="ai-chat-row ai-chat-row-assistant">
            <AssistantAvatar />
            <div className="ai-chat-bubble ai-chat-bubble-assistant ai-chat-typing">
              <span className="sr-only">Typing…</span>
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      <div className="ai-chat-prompts">
        {suggestedPrompts.map((prompt) => (
          <button
            type="button"
            onClick={() => ask(prompt)}
            disabled={typing}
            key={prompt}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="ai-chat-form" onSubmit={handleSubmit}>
        <label htmlFor="ai-chat-input" className="sr-only">
          Ask a question
        </label>
        <input
          id="ai-chat-input"
          type="text"
          placeholder="Ask about Aaryan's projects, skills, or background…"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          autoComplete="off"
        />
        <button type="submit" disabled={!question.trim() || typing}>
          Send
        </button>
      </form>
    </div>
  );
}
