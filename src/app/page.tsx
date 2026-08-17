import { Suspense } from "react";
import { LeetCodeActivity, LeetCodeActivitySkeleton } from "./_components/leetcode-activity";
import { TextReveal } from "./_components/text-reveal";
import { ThemeToggle } from "./_components/theme-toggle";

const projects = [
  {
    number: "01",
    status: "AI / NLP + Blockchain",
    title: "SkillChain",
    type: "Developer intelligence · Verification",
    summary:
      "An AI-powered developer verification platform that analyzes GitHub repositories, generates skill scores, and anchors certificates on-chain.",
    goal:
      "Turn public repository activity into structured, recruiter-friendly evidence of a developer's capabilities.",
    build:
      "GitHub repository analysis, NLP-based skill scoring, recruiter evaluation workflows, and smart-contract certificate verification.",
    stack: "GitHub API · NLP · Solidity · Ethers.js · Polygon Amoy",
    tags: ["GitHub API", "NLP", "Solidity", "Ethers.js", "Polygon Amoy"],
    visual: "skillchain",
  },
  {
    number: "02",
    status: "Full-stack + Chrome extension",
    title: "Work-Stack",
    type: "Productivity · Semantic search",
    summary:
      "An AI-powered productivity and bookmark platform for organizing knowledge, tracking activity, and collaborating from web or browser.",
    goal:
      "Make fragmented bookmarks, tasks, and browsing activity easier to organize, retrieve, and share.",
    build:
      "Semantic search, AI-assisted organization, activity tracking, collaborative collections, and a companion extension with independent authentication and session restore.",
    stack: "React · Supabase · PostgreSQL · Chrome extension · NLP",
    tags: ["React", "Supabase", "PostgreSQL", "Chrome extension", "NLP"],
    visual: "workstack",
  },
  {
    number: "03",
    status: "Real-time full-stack app",
    title: "Soul-Voyage",
    type: "Realtime · Geospatial experience",
    summary:
      "A real-time web application that combines live location data with interactive geographic visualization and cross-session updates.",
    goal:
      "Turn live location updates into an interactive shared experience across authenticated sessions.",
    build:
      "Firebase-backed state, WebSocket events, WebGL Earth visualizations, Google OAuth 2.0, and event-driven cross-session synchronization.",
    stack: "React · Firebase · WebSockets · WebGL Earth · Google OAuth",
    tags: ["React", "Firebase", "WebSockets", "WebGL Earth", "OAuth 2.0"],
    visual: "soulvoyage",
  },
];

const principles = [
  {
    number: "01",
    title: "Build end to end",
    body: "I like owning the full path from product idea and architecture through implementation, integration, and a deployment-ready build.",
  },
  {
    number: "02",
    title: "Make intelligence useful",
    body: "AI earns its place when it improves a real workflow, whether that means semantic retrieval, developer verification, or smarter organization.",
  },
  {
    number: "03",
    title: "Design connected systems",
    body: "Authentication, APIs, databases, browser sessions, and real-time events all need to work together as one coherent product experience.",
  },
  {
    number: "04",
    title: "Strengthen the fundamentals",
    body: "Consistent problem solving and a strong DSA foundation help me reason clearly about performance, tradeoffs, and maintainable implementation.",
  },
];

const toolkit = [
  {
    label: "Languages",
    items: ["Python", "JavaScript / TypeScript", "C++", "SQL", "Solidity"],
  },
  {
    label: "Full-stack & data",
    items: [
      "React / Next.js",
      "Node.js / Express.js",
      "PostgreSQL / MongoDB",
      "REST APIs / WebSockets",
      "OAuth 2.0 / authentication",
      "HTML / CSS",
    ],
  },
  {
    label: "AI / ML",
    items: [
      "Machine learning / deep learning",
      "Natural language processing",
      "TensorFlow / scikit-learn",
      "Pandas / NumPy",
      "spaCy / NLTK",
    ],
  },
  {
    label: "Platforms & delivery",
    items: [
      "Supabase / Firebase",
      "Git / GitHub / GitHub API",
      "Playwright / Postman",
      "Vercel / Render",
      "Chrome extensions / Linux",
    ],
  },
];

const credentials = [
  {
    source: "NPTEL / IIT Madras",
    detail: "Design & Analysis of Algorithms · Programming, DS & Algorithms using Python",
  },
  {
    source: "Oracle Academy",
    detail: "Database Foundations · Database Design · SQL & PL/SQL",
  },
  {
    source: "Red Hat Academy",
    detail: "System Administration I & II · RH124 · RH134",
  },
  {
    source: "Cisco + CodeChef",
    detail: "CCNA essentials · Python Essentials 1 · Data Structures & Algorithms Lab",
  },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={diagonal ? "arrow-diagonal" : undefined}
      viewBox="0 0 20 20"
      width="20"
      height="20"
    >
      <path d="M3.5 10h12M11 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

function ProjectVisual({ variant }: { variant: string }) {
  if (variant === "skillchain") {
    return (
      <div className="project-visual evaluation-visual" aria-hidden="true">
        <div className="visual-toolbar">
          <span>REPOSITORY / ANALYSIS</span>
          <i>Verified</i>
        </div>
        <div className="query-card">
          <span>Developer signal</span>
          <p>GitHub activity → structured skill profile</p>
        </div>
        <div className="pipeline">
          <span>Analyze</span>
          <i />
          <span>Score</span>
          <i />
          <span>Certify</span>
          <i />
          <span>Verify</span>
        </div>
        <div className="metric-row">
          <div><small>Analysis</small><strong>AI + NLP</strong></div>
          <div><small>Certificate</small><strong>On-chain</strong></div>
          <div><small>Workflow</small><strong>Recruiter-ready</strong></div>
        </div>
      </div>
    );
  }

  if (variant === "workstack") {
    return (
      <div className="project-visual multimodal-visual" aria-hidden="true">
        <div className="source-stack">
          <div><span>01</span><strong>Bookmark</strong><i /><i /><i /></div>
          <div><span>02</span><strong>Activity</strong><b className="mini-bars"><i /><i /><i /></b></div>
          <div><span>03</span><strong>Collection</strong><b className="mini-table"><i /><i /><i /><i /></b></div>
        </div>
        <div className="reason-core"><span>NLP</span><strong>Organize</strong></div>
        <div className="output-node"><span>Semantic result</span><strong>Right context, faster</strong><small>Synced across web and browser</small></div>
        <i className="connector connector-one" />
        <i className="connector connector-two" />
      </div>
    );
  }

  return (
    <div className="project-visual inference-visual" aria-hidden="true">
      <div className="chart-title"><span>Live location network</span><small>WebSockets × Firebase × WebGL</small></div>
      <div className="chart-label-y">REGION</div>
      <div className="scatter-plot">
        <i className="point point-one" />
        <i className="point point-two" />
        <i className="point point-three" />
        <i className="point point-four" />
        <i className="point point-five" />
        <span className="sweet-spot" />
      </div>
      <div className="chart-label-x">EVENT TIMELINE →</div>
      <div className="route-card"><span>Cross-session sync</span><strong>Live update</strong><small>OAuth protected</small></div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="#top" aria-label="Aaryan Gupta, home">
            <span className="brand-symbol">AG</span>
            <span className="brand-name">Aaryan Gupta</span>
          </a>

          <nav aria-label="Primary navigation">
            <a href="#work">Work</a>
            <a href="#approach">Approach</a>
            <a href="#toolkit">Toolkit</a>
            <a href="#leetcode">Activity</a>
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <a className="nav-cta" href="#page-end">
              Let&apos;s talk <ArrowIcon />
            </a>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero section-shell" id="top">
          <div className="hero-copy">
            <p className="status-pill"><i /> B.Tech CSE (AI &amp; ML) · 2023–Present</p>
            <h1>
              Building intelligent products
              <span>end to end.</span>
            </h1>
            <p className="hero-intro">
              I&apos;m Aaryan, a full-stack software engineer and fourth-year
              Computer Science (AI &amp; ML) student building web applications,
              browser extensions, and AI/NLP-powered platforms.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">Explore selected work <ArrowIcon /></a>
              <a className="text-link" href="#profile">More about me <ArrowIcon diagonal /></a>
            </div>
          </div>

          <aside className="hero-card" aria-label="Aaryan Gupta profile summary">
            <div className="hero-card-top"><span>Profile / 01</span><span>Faridabad · India</span></div>
            <div className="monogram-field" aria-hidden="true">
              <span className="monogram">AG</span>
              <i className="orbit orbit-one" />
              <i className="orbit orbit-two" />
              <i className="orbit-dot" />
            </div>
            <div className="hero-card-bottom">
              <div><span>Focus</span><strong>Full-stack + AI</strong></div>
              <div><span>Approach</span><strong>Build end to end</strong></div>
            </div>
          </aside>

          <a className="scroll-cue" href="#work">
            <span>Scroll to explore</span>
            <i />
          </a>
        </section>

        <section className="capability-rail" aria-label="Engineering focus">
          <div><span>01</span><strong>Full-stack</strong><p>React · Next.js · Node.js</p></div>
          <div><span>02</span><strong>AI &amp; NLP</strong><p>ML · semantic search · NLP</p></div>
          <div><span>03</span><strong>Data &amp; realtime</strong><p>PostgreSQL · MongoDB · Firebase</p></div>
        </section>

        <section className="work section-shell" id="work">
          <div className="section-intro reveal-on-scroll">
            <p className="kicker">01 / Selected work</p>
            <h2>Products built across<br />the entire stack.</h2>
            <p className="section-lede">
              Three end-to-end projects spanning AI/NLP, browser tooling,
              blockchain verification, real-time systems, and interactive web experiences.
            </p>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card reveal-on-scroll" key={project.number}>
                <div className="project-meta">
                  <span>{project.number}</span>
                  <p>{project.status}</p>
                </div>

                <div className="project-content">
                  <div className="project-heading">
                    <div>
                      <p>{project.type}</p>
                      <h3>{project.title}</h3>
                    </div>
                    <a
                      href="https://github.com/Aaryan0091"
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Explore Aaryan's GitHub projects, including ${project.title}`}
                    >
                      <ArrowIcon diagonal />
                    </a>
                  </div>
                  <p className="project-summary">{project.summary}</p>
                  <ProjectVisual variant={project.visual} />
                  <div className="case-grid">
                    <div><span>Product goal</span><p>{project.goal}</p></div>
                    <div><span>What I built</span><p>{project.build}</p></div>
                    <div><span>Core stack</span><p>{project.stack}</p></div>
                  </div>
                  <ul className="tag-list" aria-label={`${project.title} technologies`}>
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <TextReveal className="design-statement">
          The strongest products connect thoughtful interfaces, reliable systems,
          and useful intelligence into one seamless experience.
        </TextReveal>

        <section className="approach" id="approach">
          <div className="section-shell approach-shell">
            <div className="approach-heading reveal-on-scroll">
              <p className="kicker">02 / How I work</p>
              <h2>Every layer should<br />work together.</h2>
              <p>
                I approach products as connected systems: interface, API, data,
                intelligence, authentication, and deployment all shape the experience.
              </p>
            </div>

            <div className="principles-grid">
              {principles.map((principle) => (
                <article className="reveal-on-scroll" key={principle.number}>
                  <span>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="toolkit section-shell" id="toolkit">
          <div className="section-intro reveal-on-scroll">
            <p className="kicker">03 / Technical toolkit</p>
            <h2>A practical stack<br />for shipping ideas.</h2>
            <p className="section-lede">
              Languages, frameworks, AI libraries, databases, and platforms I use
              to move from concept to a working full-stack product.
            </p>
          </div>

          <div className="toolkit-grid">
            {toolkit.map((group, index) => (
              <article className="reveal-on-scroll" key={group.label}>
                <span>0{index + 1}</span>
                <h3>{group.label}</h3>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>

          <div className="credentials-block reveal-on-scroll">
            <div className="credentials-heading">
              <p className="kicker">Coursework &amp; certifications</p>
              <h3>Learning that reinforces the build.</h3>
            </div>
            <div className="credentials-grid">
              {credentials.map((credential, index) => (
                <article key={credential.source}>
                  <span>0{index + 1}</span>
                  <strong>{credential.source}</strong>
                  <p>{credential.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="leetcode section-shell" id="leetcode">
          <div className="section-intro reveal-on-scroll">
            <p className="kicker">04 / Coding activity</p>
            <h2>Consistency,<br />made visible.</h2>
            <p className="section-lede">
              Live problem-solving activity from LeetCode—covering difficulty,
              momentum, and the recent work behind the numbers.
            </p>
          </div>
          <Suspense fallback={<LeetCodeActivitySkeleton />}>
            <LeetCodeActivity />
          </Suspense>
        </section>

        <section className="profile section-shell" id="profile">
          <div className="profile-heading reveal-on-scroll">
            <p className="kicker">05 / Profile</p>
            <h2>Student by chapter.<br /><span>Builder by practice.</span></h2>
          </div>
          <div className="profile-copy reveal-on-scroll">
            <p>
              I&apos;m pursuing a B.Tech in Computer Science (AI &amp; ML) at Manipal
              University Jaipur. My work combines full-stack engineering with
              machine learning and NLP to turn ideas into deployment-ready products.
            </p>
            <p>
              Alongside independently shipping three projects, I&apos;ve solved 165
              LeetCode problems and participated in the internal round of
              Smart India Hackathon 2024 at Manipal University Jaipur.
            </p>
            <div className="profile-facts" aria-label="Education and achievements">
              <div><strong>165</strong><span>LeetCode problems solved</span></div>
              <div><strong>03</strong><span>End-to-end projects shipped</span></div>
              <div><strong>2023–Present</strong><span>B.Tech CSE (AI &amp; ML)</span></div>
            </div>
            <div className="profile-links">
              <a href="/Aaryan_Gupta_Resume.pdf" target="_blank" rel="noreferrer">Résumé <ArrowIcon diagonal /></a>
              <a href="https://github.com/Aaryan0091" target="_blank" rel="noreferrer">GitHub <ArrowIcon diagonal /></a>
              <a href="https://www.linkedin.com/in/aaryan-gupta-1262a1284" target="_blank" rel="noreferrer">LinkedIn <ArrowIcon diagonal /></a>
              <a href="https://leetcode.com/u/Aaryan91" target="_blank" rel="noreferrer">LeetCode <ArrowIcon diagonal /></a>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-shell reveal-on-scroll">
            <p className="kicker">06 / Start a conversation</p>
            <h2>Have an idea worth building?</h2>
            <a href="mailto:aaryangupta2005@gmail.com">
              Let&apos;s create something
              <span>useful together.</span>
              <ArrowIcon diagonal />
            </a>
            <div className="contact-meta">
              <span>AARYANGUPTA2005@GMAIL.COM</span>
              <span>FARIDABAD · HARYANA · INDIA</span>
            </div>
          </div>
        </section>
      </main>

      <footer id="page-end">
        <div className="footer-shell">
          <a className="brand" href="#top" aria-label="Back to top">
            <span className="brand-symbol">AG</span>
            <span className="brand-name">Full-stack products with intelligence built in.</span>
          </a>
          <div className="footer-links">
            <a href="#top">Top</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </div>
          <p>© 2026 Aaryan Gupta</p>
        </div>
      </footer>
    </>
  );
}
