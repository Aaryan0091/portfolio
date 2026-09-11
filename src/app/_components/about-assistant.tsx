"use client";

import { useEffect, useState, type FormEvent } from "react";

type AssistantTopicIcon = "about" | "projects" | "skills" | "dsa" | "contact" | "resume";

const suggestedTopics: Array<{
  label: string;
  question: string;
  icon: AssistantTopicIcon;
}> = [
  { label: "About", question: "Tell me about Aaryan.", icon: "about" },
  { label: "Projects", question: "What has Aaryan built?", icon: "projects" },
  { label: "Skills", question: "What is his tech stack?", icon: "skills" },
  { label: "DSA", question: "Tell me about his LeetCode practice.", icon: "dsa" },
  { label: "Contact", question: "How can I contact Aaryan?", icon: "contact" },
  { label: "Résumé", question: "Where can I find Aaryan's resume?", icon: "resume" },
];

const rotatingPrompts = [
  "What does Aaryan build?",
  "Which technologies does he use?",
  "Tell me about his AI projects.",
  "How can I contact Aaryan?",
];

const introAnswer =
  "Ask me about Aaryan’s projects, technical skills, education, or problem-solving practice. I’ll keep it brief.";

function answerQuestion(question: string) {
  const normalized = question.toLowerCase();

  if (/project|built|build|work|portfolio/.test(normalized)) {
    return "Aaryan has built SkillChain, Work-Stack, and Soul-Voyage—projects spanning AI/NLP, blockchain verification, browser tooling, semantic search, and real-time web experiences.";
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
    return "You can open Aaryan’s résumé from the Profile section above, alongside his GitHub, LinkedIn, and LeetCode links.";
  }

  if (/leetcode|problem|dsa|algorithm/.test(normalized)) {
    return "He practices data structures and algorithms consistently on LeetCode. His live solved totals and yearly activity graph are available in the Coding Activity section above.";
  }

  if (/contact|email|reach|hire|connect/.test(normalized)) {
    return "You can reach Aaryan at aaryangupta2005@gmail.com or use the LinkedIn and GitHub links in his profile section.";
  }

  if (/ai|machine learning|ml|nlp/.test(normalized)) {
    return "Aaryan works with machine learning, deep learning, NLP, TensorFlow, scikit-learn, spaCy, and NLTK, applying them to practical product workflows.";
  }

  return "I can best answer questions about Aaryan’s projects, skills, education, LeetCode practice, or how to contact him.";
}

function TopicIcon({ icon }: { icon: AssistantTopicIcon }) {
  const paths: Record<AssistantTopicIcon, React.ReactNode> = {
    about: <><circle cx="12" cy="8" r="3" /><path d="M6.8 19c.7-3.1 2.4-4.8 5.2-4.8s4.5 1.7 5.2 4.8" /></>,
    projects: <><rect x="4" y="7" width="16" height="12" rx="2.5" /><path d="M9 7V5.5h6V7M4 12h16" /></>,
    skills: <><path d="m12 3 7.5 4.2L12 11.4 4.5 7.2 12 3Z" /><path d="m4.5 12 7.5 4.2 7.5-4.2M4.5 16.7 12 21l7.5-4.3" /></>,
    dsa: <><path d="M5 5h5v5H5zM14 14h5v5h-5zM14 5h5M5 14h5M16.5 10v4M10 16.5h4" /></>,
    contact: <><path d="M4 7.5 12 13l8-5.5" /><rect x="3" y="5" width="18" height="14" rx="2.5" /></>,
    resume: <><path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5M10 16h5" /></>,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[icon]}
    </svg>
  );
}

export function AboutAssistant() {
  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [answer, setAnswer] = useState(introAnswer);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (question) return;

    const interval = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % rotatingPrompts.length);
    }, 3_200);

    return () => window.clearInterval(interval);
  }, [question]);

  const ask = (nextQuestion: string) => {
    const trimmedQuestion = nextQuestion.trim();
    if (!trimmedQuestion) return;

    setLastQuestion(trimmedQuestion);
    setAnswer(answerQuestion(trimmedQuestion));
    setQuestion("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <section className="about-assistant" aria-labelledby="assistant-title">
      <div className="assistant-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="assistant-shell">
        <div className="assistant-intro">
          <p className="kicker">07 / Portfolio assistant</p>
          <p className="assistant-overline"><i /> Meet Aaryan&apos;s portfolio guide</p>
          <h2 id="assistant-title">Curious about <span>Aaryan?</span></h2>
          <p>Ask a quick question about my work, skills, or background.</p>
        </div>

        <div className="assistant-avatar" aria-hidden="true">
          <span />
          <svg viewBox="0 0 160 160">
            <path className="assistant-avatar-fill" d="M43 67c2-27 17-43 37-43s35 16 37 43c10 5 15 16 12 28-2 9-9 15-18 17-7 19-18 29-31 29s-24-10-31-29c-9-2-16-8-18-17-3-12 2-23 12-28Z" />
            <path d="M42 69c1-28 17-45 38-45s37 17 38 45M49 109c7 21 18 32 31 32s24-11 31-32" />
            <path d="M35 78c12-2 21-7 27-16 13 10 34 15 63 13M60 88c4-3 9-3 13 0M88 88c4-3 9-3 13 0M78 91l-4 13 8 2M70 118c7 5 15 5 22 0" />
            <path className="assistant-avatar-cap" d="M38 66c8-15 22-23 42-23s34 8 42 23c-14 7-28 10-42 10s-28-3-42-10ZM56 44l4-18h40l4 18" />
          </svg>
        </div>

        <div id="assistant-response" className="assistant-response" aria-live="polite" aria-atomic="true">
          <span className="assistant-question">
            {lastQuestion ? `You asked: ${lastQuestion}` : "Portfolio assistant · demo mode"}
          </span>
          <p>{answer}</p>
        </div>

        <form className="assistant-form" onSubmit={handleSubmit}>
          <label htmlFor="portfolio-question">Ask the portfolio assistant</label>
          <div>
            {!question ? (
              <span className="assistant-rotating-prompt" key={rotatingPrompts[promptIndex]} aria-hidden="true">
                Ask me anything — {rotatingPrompts[promptIndex]}
              </span>
            ) : null}
            <input
              id="portfolio-question"
              name="portfolio-question"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              autoComplete="off"
              aria-describedby="assistant-response"
            />
            <button type="submit" disabled={!question.trim()} aria-label="Ask the portfolio assistant">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 12h14M14 7l5 5-5 5" />
              </svg>
            </button>
          </div>
        </form>

        <div className="assistant-suggestions" aria-label="Suggested questions">
          {suggestedTopics.map((topic) => (
            <button type="button" onClick={() => ask(topic.question)} key={topic.label}>
              <TopicIcon icon={topic.icon} />
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
