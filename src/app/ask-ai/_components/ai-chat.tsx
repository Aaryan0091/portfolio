"use client";

import { useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const suggestedPrompts = [
  "Tell me about Aaryan.",
  "What has Aaryan built?",
  "What is his tech stack?",
  "Tell me about his LeetCode practice.",
  "How can I contact Aaryan?",
];

const introMessage: Message = {
  role: "assistant",
  text: "Ask me about Aaryan's projects, technical skills, education, or problem-solving practice. I'll keep answers grounded in what's actually on his portfolio.",
};

function answerQuestion(question: string) {
  const normalized = question.toLowerCase();

  if (/project|built|build|work|portfolio/.test(normalized)) {
    return "Aaryan has built SkillChain, Work-Stack, and Soul-Voyage — projects spanning AI/NLP, blockchain verification, browser tooling, semantic search, and real-time web experiences.";
  }

  if (/stack|skill|technology|technologies|tool/.test(normalized)) {
    return "His core stack includes React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Supabase, Firebase, Python, and NLP/ML tooling.";
  }

  if (/strength|good at|special|focus/.test(normalized)) {
    return "His strength is connecting the full product: thoughtful interfaces, reliable APIs and data, authentication, real-time features, and useful AI capabilities.";
  }

  if (/education|college|university|student|degree/.test(normalized)) {
    return "Aaryan is pursuing a B.Tech in Computer Science (AI & ML) at Manipal University Jaipur, from 2023 to the present.";
  }

  if (/resume|résumé|cv/.test(normalized)) {
    return "You can open Aaryan's résumé from the Profile section on the main site, alongside his GitHub, LinkedIn, and LeetCode links.";
  }

  if (/leetcode|problem|dsa|algorithm/.test(normalized)) {
    return "He practices data structures and algorithms consistently on LeetCode. His live solved totals and yearly activity graph are on the main portfolio page.";
  }

  if (/contact|email|reach|hire|connect/.test(normalized)) {
    return "You can reach Aaryan at aaryangupta2005@gmail.com, or through the GitHub and LinkedIn links on his portfolio.";
  }

  if (/ai|machine learning|ml|nlp/.test(normalized)) {
    return "Aaryan works with machine learning, deep learning, NLP, TensorFlow, scikit-learn, spaCy, and NLTK, applying them to practical product workflows like SkillChain.";
  }

  if (/hackathon|award|experience|credential/.test(normalized)) {
    return "He participated in the internal round of Smart India Hackathon 2024 at Manipal University Jaipur, and holds certifications from NPTEL/IIT Madras, Oracle Academy, Red Hat Academy, and Cisco + CodeChef.";
  }

  return "I can best answer questions about Aaryan's projects, skills, education, LeetCode practice, awards, or how to contact him.";
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([introMessage]);
  const [question, setQuestion] = useState("");

  const ask = (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "assistant", text: answerQuestion(trimmed) },
    ]);
    setQuestion("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-log" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`ai-chat-bubble ai-chat-bubble-${message.role}`} key={index}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="ai-chat-prompts">
        {suggestedPrompts.map((prompt) => (
          <button type="button" onClick={() => ask(prompt)} key={prompt}>
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
        <button type="submit" disabled={!question.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
