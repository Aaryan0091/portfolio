import Link from "next/link";
import { IdeaForm } from "./_components/idea-form";
import { NewUiHeader } from "./_components/site-header";
import { PortraitScrollLink } from "./_components/portrait-scroll-link";
import { AwardsHeadingReveal } from "./_components/awards-heading-reveal";
import { AwardsPinSequence } from "./_components/awards-pin-sequence";
import { SmoothScroll } from "./_components/smooth-scroll";
import { MotionPathReveal } from "./_components/motion-path-reveal";
import { PathEditor } from "./_components/path-editor";

const lineCount = 5;

/**
 * Scroll-triggered entrances, one per section.
 *
 * Module-level so the array reference stays stable across renders — a fresh
 * literal each render would retrigger MotionPathReveal's effect and rebuild
 * every ScrollTrigger.
 *
 * Each `path` is a list of px offsets from where CSS already puts the element.
 * The FIRST point is where it flies in from, the middle points bend the curve,
 * and the LAST is always {x: 0, y: 0} so it settles into its real layout spot.
 *
 * Directions deliberately alternate — left, right, up — so six sections don't
 * read as the same effect six times.
 *
 * These are all scroll-bound (MotionPathReveal defaults to `scrub: true`), so
 * `start`/`end` — not `duration` — are what pace them. The pair defines the
 * band of scrolling the flight is spread across: the elements are at their
 * start position when the trigger's top hits `start`, fully landed when it
 * hits `end`, and frozen wherever you stop in between.
 *
 * `trigger` is always the element that directly wraps the targets, never the
 * whole <section>. A section's top can sit hundreds of px above its content,
 * and triggering there burns the entire flight while the targets are still
 * below the fold. That bug is why Featured Work triggers on its grid.
 */
const sectionReveals = [
  // NOTE: Awards is absent on purpose. Its heading pins at the centre of the
  // screen and its content rises underneath, which is a different shape of
  // animation entirely — see awards-pin-sequence.tsx.
  {
    id: "services",
    targets: ".new-ui-service-item",
    trigger: ".new-ui-services-list",
    path: [
      { x: -150, y: 50 },
      { x: -38, y: -14 },
      { x: 0, y: 0 },
    ],
    start: "top 84%",
    duration: 1.15,
    stagger: 0.11,
    curviness: 1.5,
  },
  {
    id: "work-steps",
    // Steps should feel sequential, so they rise straight up in order with a
    // slightly longer gap between them than the other sections use.
    targets: ".new-ui-step-card",
    trigger: ".new-ui-work-steps",
    path: [
      { x: 0, y: 130 },
      { x: 16, y: -30 },
      { x: 0, y: 0 },
    ],
    start: "top 84%",
    duration: 1.25,
    stagger: 0.17,
    curviness: 1.4,
  },
  {
    id: "featured",
    targets: ".new-ui-featured-card",
    trigger: ".new-ui-featured-grid",
    path: [
      { x: 190, y: 64 },
      { x: 58, y: -34 },
      { x: 0, y: 0 },
    ],
    start: "top 88%",
    duration: 1.25,
    stagger: 0.14,
    curviness: 1.6,
  },
  {
    id: "insights",
    targets: ".new-ui-insight-card",
    trigger: ".new-ui-insights-grid",
    path: [
      { x: 150, y: 60 },
      { x: 36, y: -18 },
      { x: 0, y: 0 },
    ],
    start: "top 84%",
    duration: 1.2,
    stagger: 0.12,
    curviness: 1.5,
  },
  {
    id: "contact",
    // Only the contact cards, not the form — animating inputs that someone may
    // be about to click is a good way to make a form feel broken.
    targets: ".new-ui-contact-card",
    trigger: ".new-ui-contact-cards",
    path: [
      { x: 0, y: 80 },
      { x: 0, y: -18 },
      { x: 0, y: 0 },
    ],
    start: "top 88%",
    duration: 1.1,
    stagger: 0.14,
    curviness: 1.3,
  },
];

export default function NewUI() {
  return (
    <div className="new-ui-root">
      {/* Fixed-position elements live outside #smooth-content — a transformed
          ancestor would otherwise become their containing block and drag them
          up the page along with the content. */}
      <NewUiHeader />

      <SmoothScroll>
        <NewUiBody />
      </SmoothScroll>

      <PortraitScrollLink />
      <AwardsHeadingReveal />
      <AwardsPinSequence />
      {sectionReveals.map((config) => (
        <MotionPathReveal key={config.id} {...config} />
      ))}
      <PathEditor />
    </div>
  );
}

function NewUiBody() {
  return (
    <main className="new-ui-page">
      <div className="new-ui-backdrop" aria-hidden="true">
        <span className="new-ui-glow" />
        <div className="new-ui-lines">
          {Array.from({ length: lineCount }).map((_, index) => (
            <span
              className="new-ui-line"
              key={index}
              style={{ left: `${((index + 1) / (lineCount + 1)) * 100}%` }}
            >
              <span
                className={`new-ui-line-pulse ${index % 2 === 0 ? "new-ui-line-pulse-down" : "new-ui-line-pulse-up"}`}
                style={{
                  animationDuration: `${5 + (index % 5)}s`,
                  animationDelay: `${-(index * 0.7)}s`,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      <section className="new-ui-hero">
        <div className="new-ui-hero-video" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/video/hero-bg-poster.jpg"
          >
            <source src="/video/hero-bg.mp4" type="video/mp4" />
          </video>
          <span className="new-ui-hero-video-overlay" />
        </div>

        <div className="new-ui-hero-copy">
          <h1 className="new-ui-name">Aaryan Gupta</h1>
          <p className="new-ui-intro">
            I&apos;m Aaryan, a full-stack developer helping startups, founders,
            and companies launch world-class products.
          </p>
          <div className="new-ui-actions">
            <a className="new-ui-primary" href="mailto:aaryangupta2005@gmail.com">
              Hire Me
            </a>
            <Link className="new-ui-secondary" href="/#work">
              View My Work
            </Link>
          </div>
        </div>

        <div className="new-ui-portrait" aria-hidden="true">
          <span className="new-ui-portrait-glow" />
          <span className="new-ui-portrait-mark">AG</span>
        </div>
      </section>

      <section className="new-ui-about" id="about">
        <h2 className="new-ui-about-heading">About Me</h2>

        <div className="new-ui-about-grid">
          <aside className="new-ui-skills-card">
            <h3>Skills &amp; Tech Stack</h3>
            <div className="new-ui-skills-grid">
              <span>React</span>
              <span>Python</span>
              <span>Node.js</span>
              <span>TypeScript</span>
            </div>
          </aside>

          <div className="new-ui-about-main">
            <div className="new-ui-about-portrait" aria-hidden="true">
              <span className="new-ui-portrait-glow" />
              <span className="new-ui-portrait-mark">AG</span>
            </div>
            <p className="new-ui-about-copy">
              I build full-stack products end to end — from AI-powered
              developer tools to real-time, browser-connected experiences.
              With a strong foundation in data structures and algorithms, I
              turn ideas into clean, scalable, deployment-ready builds.
            </p>
          </div>

          <div className="new-ui-stats">
            <div className="new-ui-stat-card">
              <span>Projects shipped</span>
              <strong>03</strong>
            </div>
            <div className="new-ui-stat-card">
              <span>B.Tech CSE (AI &amp; ML)</span>
              <strong>2023–Present</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="new-ui-awards" id="awards">
        <h2 className="new-ui-about-heading new-ui-awards-heading">Awards &amp; Experiences</h2>

        <div className="new-ui-awards-layout">
          <p className="new-ui-awards-intro">
            Building end-to-end products through academic work, independent
            projects, and hackathons.
          </p>

          <div className="new-ui-awards-card">
            <div>
              <h3>Experience</h3>
              <ul className="new-ui-awards-list">
                <li>
                  <span>B.Tech CSE (AI &amp; ML)</span>
                  <span>Manipal University Jaipur (2023–Present)</span>
                </li>
                <li>
                  <span>Independent projects</span>
                  <span>SkillChain · Work-Stack · Soul-Voyage</span>
                </li>
                <li>
                  <span>Smart India Hackathon 2024</span>
                  <span>Internal round participant</span>
                </li>
              </ul>
            </div>

            <div>
              <h3>Awards &amp; Credentials</h3>
              <ul className="new-ui-awards-list">
                <li>
                  <span>NPTEL / IIT Madras</span>
                  <span>DAA · DS &amp; Algorithms using Python</span>
                </li>
                <li>
                  <span>Oracle Academy</span>
                  <span>Database Foundations · SQL &amp; PL/SQL</span>
                </li>
                <li>
                  <span>Red Hat Academy</span>
                  <span>System Administration I &amp; II</span>
                </li>
                <li>
                  <span>Cisco + CodeChef</span>
                  <span>CCNA essentials · DSA Lab</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="new-ui-awards-side">
            <div className="new-ui-awards-portrait" aria-hidden="true">
              <span className="new-ui-portrait-glow" />
              <span className="new-ui-portrait-mark">AG</span>
            </div>
            <a className="new-ui-primary" href="mailto:aaryangupta2005@gmail.com">
              Hire Me
            </a>
          </div>
        </div>
      </section>

      <section className="new-ui-services" id="services">
        <h2 className="new-ui-services-heading new-ui-services-main-heading">
          Services I Offer
        </h2>

        <div className="new-ui-services-list">
          {[
            {
              number: "01",
              title: "Web App Development",
              intro: "Build modern, fast, and scalable web applications.",
              stack: "React · Next.js · Node.js",
            },
            {
              number: "02",
              title: "Frontend Engineering",
              intro: "Craft clean, responsive, user-friendly interfaces.",
              stack: "React · TypeScript · CSS",
            },
            {
              number: "03",
              title: "Backend Development",
              intro: "Design secure and scalable server-side systems.",
              stack: "Node.js · PostgreSQL · MongoDB",
            },
            {
              number: "04",
              title: "AI Feature Integration",
              intro: "Embed AI tools and LLMs into real-world apps.",
              stack: "Python · NLP · TensorFlow",
            },
          ].map((service) => (
            <div className="new-ui-service-item" key={service.number}>
              <p className="new-ui-service-intro">{service.intro}</p>
              <div className="new-ui-service-card">
                <div className="new-ui-service-top">
                  <span className="new-ui-service-number">{service.number}</span>
                  <h3>{service.title}</h3>
                </div>
                <div className="new-ui-service-stat">
                  <strong>{service.stack}</strong>
                  <span>Core stack</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="new-ui-work" id="work-procedure">
        <h2 className="new-ui-services-heading">Work Procedure</h2>

        <div className="new-ui-work-steps">
          {[
            {
              step: "Step #1",
              title: "Discovery",
              detail: "Understand your goals and challenges",
            },
            {
              step: "Step #2",
              title: "Development",
              detail: "Build clean, scalable code with modern tools",
            },
            {
              step: "Step #3",
              title: "Launch",
              detail: "Deploy, optimize, and support for success",
            },
          ].map((item) => (
            <div className="new-ui-step-card" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="new-ui-featured" id="featured-work">
        <div className="new-ui-featured-head">
          <h2 className="new-ui-name new-ui-featured-heading">
            Featured
            <br />
            Work
          </h2>
          <ul className="new-ui-featured-categories">
            <li>AI / NLP</li>
            <li>Blockchain verification</li>
            <li>Browser tooling</li>
            <li>Realtime systems</li>
            <li>Full-stack</li>
          </ul>
        </div>

        <div className="new-ui-featured-grid">
          {[
            { title: "SkillChain", tag: "AI / NLP · Blockchain" },
            { title: "Work-Stack", tag: "Full-stack · Chrome extension" },
            { title: "Soul-Voyage", tag: "Realtime · WebGL" },
          ].map((project) => (
            <a className="new-ui-featured-card" href="/#work" key={project.title}>
              <span className="new-ui-featured-glow" aria-hidden="true" />
              <strong>{project.title}</strong>
              <span>{project.tag}</span>
            </a>
          ))}
        </div>

        <Link className="new-ui-gallery-link" href="/gallery">
          Open the interactive WebGL gallery →
        </Link>
      </section>

      <section className="new-ui-insights" id="insights">
        <h2 className="new-ui-about-heading">Insights &amp; Thoughts</h2>

        <div className="new-ui-insights-body">
          <div className="new-ui-insights-grid">
            {[
              {
                title: "Building SkillChain: turning GitHub activity into a skill score",
                tag: "AI / NLP",
              },
              {
                title: "Real-time sync in Soul-Voyage with Firebase and WebSockets",
                tag: "Realtime systems",
              },
              {
                title: "Semantic search for Work-Stack's bookmark platform",
                tag: "Full-stack",
              },
            ].map((note) => (
              <div className="new-ui-insight-card" key={note.title}>
                <span className="new-ui-insight-glow" aria-hidden="true" />
                <span className="new-ui-insight-tag">{note.tag}</span>
                <p>{note.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="new-ui-cta-section" id="contact">
        <div className="new-ui-cta-texture" aria-hidden="true" />
        <h2 className="new-ui-name new-ui-cta-heading">Got an Idea?</h2>

        <IdeaForm />

        <div className="new-ui-contact-cards">
          <a className="new-ui-contact-card" href="mailto:aaryangupta2005@gmail.com">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <span>aaryangupta2005@gmail.com</span>
          </a>
          <div className="new-ui-contact-card">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>Faridabad, Haryana, India</span>
          </div>
          <a
            className="new-ui-contact-card"
            href="https://github.com/Aaryan0091"
            target="_blank"
            rel="noreferrer"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4.5-1 4.5-4.5a4 4 0 0 0-1-2.5A3.7 3.7 0 0 0 18 5.5S17 5.2 15 6.5a10 10 0 0 0-6 0C7 5.2 6 5.5 6 5.5A3.7 3.7 0 0 0 5.9 8a4 4 0 0 0-1 2.5c0 3.5 2.5 4.3 4.5 4.5-.4.4-.5.9-.5 1.5v3.5" />
            </svg>
            <span>github.com/Aaryan0091</span>
          </a>
        </div>
      </section>

      <footer className="new-ui-footer">
        <div className="new-ui-footer-top">
          <div className="new-ui-footer-brand">
            <span className="brand-symbol">AG</span>
            <div className="new-ui-footer-social">
              <a
                href="https://github.com/Aaryan0091"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                GH
              </a>
              <a
                href="https://www.linkedin.com/in/aaryan-gupta-1262a1284"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://leetcode.com/u/Aaryan91"
                target="_blank"
                rel="noreferrer"
                aria-label="LeetCode"
              >
                LC
              </a>
              <a href="mailto:aaryangupta2005@gmail.com" aria-label="Email">
                @
              </a>
            </div>
          </div>

          <nav className="new-ui-footer-nav" aria-label="Footer navigation">
            <Link href="/">Home</Link>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#featured-work">Case Study</a>
          </nav>

          <div className="new-ui-footer-legal">
            <Link href="/terms">Terms and Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/this-page-does-not-exist">404</Link>
          </div>

          <a className="new-ui-footer-top-link" href="#top">
            Back to Top <span aria-hidden="true">↑</span>
          </a>
        </div>

        <div className="new-ui-footer-watermark" aria-hidden="true">Aaryan Gupta</div>

        <div className="new-ui-footer-bottom">
          <span>© 2026 Aaryan Gupta</span>
        </div>
      </footer>

    </main>
  );
}
