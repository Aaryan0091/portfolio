"use client";

import { useEffect, useState, type FormEvent } from "react";

const suggestedQuestions = [
  "What has Aaryan built?",
  "What is his tech stack?",
  "What are his strengths?",
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
      <div className="assistant-shell">
        <div className="assistant-intro">
          <p className="kicker">07 / Portfolio assistant demo</p>
          <h2 id="assistant-title">Curious about<br /><span>Aaryan?</span></h2>
          <p>
            A small preview of an AI-style portfolio guide, grounded only in the
            information on this website.
          </p>
        </div>

        <div className="assistant-card">
          <div className="assistant-card-header">
            <div className="assistant-identity">
              <span aria-hidden="true">AG</span>
              <div>
                <strong>Ask about Aaryan</strong>
                <small><i /> Demo assistant</small>
              </div>
            </div>
            <span className="assistant-demo-badge">No API required</span>
          </div>

          <div className="assistant-response" aria-live="polite" aria-atomic="true">
            {lastQuestion
              ? <span className="assistant-question">You asked: {lastQuestion}</span>
              : null}
            <p>{answer}</p>
          </div>

          <div className="assistant-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((suggestion) => (
              <button type="button" onClick={() => ask(suggestion)} key={suggestion}>
                {suggestion}
              </button>
            ))}
          </div>

          <form className="assistant-form" onSubmit={handleSubmit}>
            <label htmlFor="portfolio-question">Ask a short question</label>
            <div>
              {!question ? (
                <span className="assistant-rotating-prompt" key={rotatingPrompts[promptIndex]} aria-hidden="true">
                  e.g. {rotatingPrompts[promptIndex]}
                </span>
              ) : null}
              <input
                id="portfolio-question"
                name="portfolio-question"
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                autoComplete="off"
              />
              <button type="submit" disabled={!question.trim()} aria-label="Ask the portfolio assistant">
                Ask <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
