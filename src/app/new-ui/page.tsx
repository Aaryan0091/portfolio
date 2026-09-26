import Link from "next/link";
import type { CSSProperties } from "react";
// Script face for the section headings (see --font-script in globals.css).
// Imported here rather than in the root layout so the old site never loads it.
import "@fontsource/lobster/latin-400.css";
import { IdeaForm } from "./_components/idea-form";
import { NewUiHeader } from "./_components/site-header";
import { PortraitScrollLink } from "./_components/portrait-scroll-link";
import { AwardsPinSequence } from "./_components/awards-pin-sequence";
import { ServicesShowcase } from "./_components/services-showcase";
import { WorkStepsSpread } from "./_components/work-steps-spread";
import { HeadingWriteOn } from "./_components/heading-write-on";
import { FeaturedShowcase } from "./_components/featured-showcase";
import { ViewCursor } from "./_components/view-cursor";
import { PortfolioProgress } from "./_components/portfolio-progress";
import { BackgroundLines } from "./_components/background-lines";
import {
  GitHubIcon,
  LeetCodeIcon,
  LinkedInIcon,
  MailIcon,
} from "./_components/social-icons";
import { SmoothScroll } from "./_components/smooth-scroll";
import { MotionPathReveal } from "./_components/motion-path-reveal";
import { PathEditor } from "./_components/path-editor";

/**
 * Featured Work projects. Used twice: as the scattered tiles under the
 * heading, and as the zoom-in panels that grow out of them. `slug` picks the
 * artwork and panel colour (`.new-ui-art-<slug>` in globals.css) and pairs
 * each tile with its panel. Copy comes from the project data on the old page.
 */
const featuredProjects = [
  {
    slug: "skillchain",
    title: "SkillChain",
    tag: "AI / NLP · Blockchain",
    tagline: "AI developer verification, anchored on-chain",
    stack: "GitHub API · NLP · Solidity · Polygon",
  },
  {
    slug: "workstack",
    title: "Work-Stack",
    tag: "Full-stack · Chrome extension",
    tagline: "Productivity and semantic bookmark platform",
    stack: "React · Supabase · PostgreSQL · Chrome extension",
  },
  {
    slug: "soulvoyage",
    title: "Soul-Voyage",
    tag: "Realtime · WebGL",
    tagline: "Real-time geospatial web experience",
    stack: "React · Firebase · WebSockets · WebGL Earth",
  },
];

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
  // NOTE: Services is absent too. Its cards slide in horizontally on a
  // pinned stage instead — see services-showcase.tsx.
  // NOTE: Work Procedure is absent as well. Its cards deal out from a
  // single stacked card instead — see work-steps-spread.tsx.
  // NOTE: Featured Work's tile entrance is `featuredTilesReveal` below, not
  // here: it has to be created BEFORE the Featured Work pin.
  {
    id: "insights",
    targets: ".new-ui-insight-card",
    trigger: ".new-ui-insights-grid",
    path: [
      { x: 150, y: 60 },
      { x: 36, y: -18 },
      { x: 0, y: 0 },
    ],
    // About a third more scroll than the default band (84% → 38%), so the
    // cards glide in more slowly.
    start: "top 88%",
    end: "top 26%",
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
    // All three rise together (no stagger) and are fully in place by the time
    // the row is 80% of the way down the screen. They used to be staggered
    // and finish at "top 38%" — near the bottom of the page that point often
    // can't be scrolled to, so the boxes sat mid-flight at uneven heights.
    start: "top bottom",
    end: "top 80%",
    duration: 1.1,
    stagger: 0,
    curviness: 1.3,
  },
];

/**
 * Where each Featured Work tile sits, measured off the reference moodboard:
 * left, top and width as % of the tile area's width, plus width/height.
 * Projects fill these in order — three projects take the first row; add
 * more to `featuredProjects` and they land in the next spots automatically.
 */
const featuredSlots = [
  { x: 0.6, y: 6, w: 29.1, ratio: 1.59 },
  { x: 47.4, y: 4.3, w: 13, ratio: 1.09, compact: true },
  { x: 77.6, y: 13.3, w: 21.4, ratio: 1.96 },
  { x: 35.1, y: 36.4, w: 21.4, ratio: 1.97 },
  { x: 63.6, y: 30.9, w: 21.6, ratio: 1.26 },
  { x: 0, y: 55.7, w: 19.4, ratio: 0.75 },
  { x: 49, y: 62.2, w: 20.5, ratio: 0.9 },
  { x: 77.4, y: 62.7, w: 21.4, ratio: 1.97 },
];

/**
 * How much bigger than the reference the tiles are drawn. Each tile grows
 * around its own centre, so the arrangement keeps its shape, and is then
 * nudged inward if that pushed it past an edge.
 */
const TILE_SCALE = 1.2;

// Up to eight projects; a ninth would need another slot above.
const usedSlots = featuredSlots.slice(0, featuredProjects.length).map((slot) => {
  const w = slot.w * TILE_SCALE;
  const h = w / slot.ratio;
  const centreX = slot.x + slot.w / 2;
  const centreY = slot.y + slot.w / slot.ratio / 2;
  return {
    ...slot,
    w,
    x: Math.min(Math.max(centreX - w / 2, 0), 100 - w),
    y: Math.max(centreY - h / 2, 0),
  };
});

/** Height of the tile area: the lowest tile's bottom edge, same units. */
const featuredGridHeight = Math.max(
  ...usedSlots.map((slot) => slot.y + slot.w / slot.ratio)
);

/**
 * Featured Work tiles float up into their scattered spots rather than flying
 * in from the side — a sideways entrance reads as a row, which this isn't.
 *
 * Kept out of `sectionReveals` because of mount order: it finishes just
 * BEFORE the Featured Work pin starts, and a trigger created after that pin
 * gets pushed down by the pin's length — the tiles were then still waiting
 * to enter while the zoom sequence ran.
 */
const featuredTilesReveal = {
  id: "featured",
  targets: ".new-ui-featured-card",
  trigger: ".new-ui-featured-grid",
  path: [
    { x: 0, y: 80 },
    { x: 0, y: -8 },
    { x: 0, y: 0 },
  ],
  // Starts the moment the tiles enter the screen and is done by the time
  // they're a quarter of the way up it, so they're visible right under the
  // heading. (It used to run to "top 38%": on shorter screens the heading sat
  // over an empty area for several scrolls while the tiles faded in).
  start: "top bottom",
  end: "top 75%",
  duration: 1.25,
  stagger: 0.14,
  curviness: 1.2,
};

export default function NewUI() {
  return (
    <div className="new-ui-root">
      {/* Fixed-position elements live outside #smooth-content — a transformed
          ancestor would otherwise become their containing block and drag them
          up the page along with the content. */}
      <NewUiHeader />
      <ViewCursor />
      <PortfolioProgress />

      <SmoothScroll>
        <NewUiBody />
      </SmoothScroll>

      <PortraitScrollLink />
      <AwardsPinSequence />
      {/* Must stay here: after the Awards pin, before the section reveals
          below it, so every later trigger accounts for its pin spacing. */}
      <ServicesShowcase />
      <WorkStepsSpread />
      <HeadingWriteOn
        id="featured"
        heading=".new-ui-featured-heading"
        lines=".new-ui-featured-heading .new-ui-write-line"
        // A wider band than the default (85% → 40%): the same writing spread
        // over ~40% more scroll, so it reads slower.
        start="top 92%"
        end="top 28%"
      />
      <MotionPathReveal {...featuredTilesReveal} />
      <FeaturedShowcase />
      <HeadingWriteOn
        id="insights"
        heading=".new-ui-insights-heading"
        lines=".new-ui-insights-heading .new-ui-write-line"
        // ~35% more scroll than the default (85% → 40%): a slower write.
        start="top 90%"
        end="top 29%"
      />
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
        <BackgroundLines />
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
        <h2 className="new-ui-about-heading new-ui-awards-heading">
          <span className="new-ui-awards-heading-text">
            Awards &amp; Experiences
          </span>
        </h2>

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

        {/* Zig-zag progress line through the cards — showcase mode only. */}
        <svg className="new-ui-services-line" aria-hidden="true">
          <defs>
            {/* Soft glow for the line: a blurred copy drawn underneath. */}
            <filter
              id="new-ui-services-line-blur"
              x="-5%"
              y="-50%"
              width="110%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <path className="new-ui-services-line-base" />
          {/* pathLength="1" lets the draw-on animate 1 → 0 whatever the
              zig-zag's real length is on this screen. */}
          <path
            className="new-ui-services-line-glow"
            pathLength={1}
            filter="url(#new-ui-services-line-blur)"
          />
          <path className="new-ui-services-line-fill" pathLength={1} />
        </svg>
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
            <span className="new-ui-write-line">Featured</span>
            <span className="new-ui-write-line">Work</span>
          </h2>
          <ul className="new-ui-featured-categories">
            <li>AI / NLP</li>
            <li>Blockchain verification</li>
            <li>Browser tooling</li>
            <li>Realtime systems</li>
            <li>Full-stack</li>
          </ul>
        </div>

        <div
          className="new-ui-featured-grid"
          style={{ "--grid-h": featuredGridHeight.toFixed(2) } as CSSProperties}
        >
          {/* Scattered like a moodboard: each tile has its own size and
              height (see globals.css). No data-speed parallax here: the
              section pins for the zoom sequence, and drift during a pin
              would pull the tiles away from the panels that grow out of
              them. */}
          {featuredProjects.map((project, index) => {
            const slot = usedSlots[index];
            return (
              <div
                className={`new-ui-featured-item${slot.compact ? " is-compact" : ""}`}
                style={
                  {
                    "--slot-x": slot.x,
                    "--slot-y": slot.y,
                    "--slot-w": slot.w,
                    "--slot-ratio": slot.ratio,
                  } as CSSProperties
                }
                key={project.slug}
              >
                <Link
                  className={`new-ui-featured-card new-ui-art-${project.slug}`}
                  href="/#work"
                  data-view-cursor
                  data-project={project.slug}
                >
                  <span className="new-ui-featured-glow" aria-hidden="true" />
                  <strong>{project.title}</strong>
                  <span>{project.tag}</span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Zoom-in overlays: while the section is pinned, each project in
            turn grows out of its tile into a large case-study panel, holds,
            then shrinks back — see featured-showcase.tsx. Hidden (and so not
            focusable) except during their turn; desktop only. */}
        <div className="new-ui-showcase-stage">
          <span className="new-ui-showcase-dim" aria-hidden="true" />
          {featuredProjects.map((project, index) => (
            <Link
              className={`new-ui-showcase-card new-ui-art-${project.slug}`}
              href="/#work"
              data-view-cursor
              data-project={project.slug}
              key={project.slug}
            >
              <span className="new-ui-showcase-media" aria-hidden="true">
                <span className="new-ui-showcase-art" />
              </span>
              {/* Copy of the tile's own label, so the first frame of the
                  zoom looks exactly like the tile it grows out of. */}
              <span className="new-ui-showcase-label" aria-hidden="true">
                <strong>{project.title}</strong>
                <span>{project.tag}</span>
              </span>
              <span className="new-ui-showcase-title">{project.title}</span>
              <span className="new-ui-showcase-meta">
                <span className="new-ui-showcase-index">
                  {String(index + 1).padStart(2, "0")} · {project.tag}
                </span>
                <span className="new-ui-showcase-tagline">{project.tagline}</span>
                <span className="new-ui-showcase-stack">{project.stack}</span>
              </span>
            </Link>
          ))}
        </div>

      </section>

      <section className="new-ui-insights" id="insights">
        <h2 className="new-ui-about-heading new-ui-insights-heading">
          <span className="new-ui-write-line">Insights &amp; Thoughts</span>
        </h2>

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
              <div className="new-ui-insight-card" data-view-cursor key={note.title}>
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
                <GitHubIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/aaryan-gupta-1262a1284"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://leetcode.com/u/Aaryan91"
                target="_blank"
                rel="noreferrer"
                aria-label="LeetCode"
              >
                <LeetCodeIcon />
              </a>
              <a href="mailto:aaryangupta2005@gmail.com" aria-label="Email">
                <MailIcon />
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
      </footer>

    </main>
  );
}
