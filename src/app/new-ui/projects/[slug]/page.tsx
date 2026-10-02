import Link from "next/link";
import { notFound } from "next/navigation";
import "@fontsource/lobster/latin-400.css";
import { BackgroundLines } from "../../_components/background-lines";
import { getProjectDetail, projectDetails } from "../../_data/projects";

export function generateStaticParams() {
  return projectDetails.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectDetail(slug);
  return {
    title: project ? `${project.title} — Aaryan Gupta` : "Project — Aaryan Gupta",
    description: project?.summary,
  };
}

/**
 * A project's case study, opened from its tile or zoom panel in Featured
 * Work. Same look as the New UI: dark teal backdrop with glowing lines,
 * Lobster headings, the project's own cover image as the hero.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectDetail(slug);
  if (!project) notFound();

  const index = projectDetails.indexOf(project);
  const next = projectDetails[(index + 1) % projectDetails.length];

  return (
    <main className="new-ui-page case-page">
      <div className="new-ui-backdrop" aria-hidden="true">
        <span className="new-ui-glow" />
        <BackgroundLines />
      </div>

      <header className="ask-ai-bar case-bar">
        <Link className="ask-ai-brand" href="/new-ui" aria-label="Aaryan Gupta, back to portfolio">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo */}
          <img className="new-ui-logo" src="/logo-a.png" alt="" />
        </Link>
        <Link className="nav-cta new-ui-back-cta" href="/new-ui#featured-work">
          ← All projects
        </Link>
      </header>

      <section className={`case-hero new-ui-art-${project.slug}`}>
        <span className="case-hero-art" aria-hidden="true" />
        <div className="case-hero-copy">
          <p className="case-eyebrow">
            {project.number} · {project.category}
          </p>
          <h1 className="case-title">{project.title}</h1>
          <p className="case-tagline">{project.tagline}</p>
          <ul className="case-stack" aria-label="Tech stack">
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {(project.live || project.repo) && (
            <div className="case-links">
              {project.live && (
                <a
                  className="nav-cta new-ui-cta"
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit live site ↗
                </a>
              )}
              {project.repo && (
                <a
                  className={`nav-cta ${project.live ? "new-ui-back-cta" : "new-ui-cta"}`}
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                >
                  View code on GitHub ↗
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="case-body">
        <section className="case-section case-overview">
          <h2>Overview</h2>
          <p className="case-lead">{project.summary}</p>
        </section>

        <div className="case-split">
          <section className="case-section case-card">
            <h2>The problem</h2>
            <p>{project.problem}</p>
          </section>
          <section className="case-section case-card">
            <h2>The solution</h2>
            <p>{project.solution}</p>
          </section>
        </div>

        <section className="case-section">
          <h2>Key features</h2>
          <div className="case-features">
            {project.features.map((feature, featureIndex) => (
              <article className="case-card case-feature" key={feature.title}>
                <span className="case-feature-number">
                  {String(featureIndex + 1).padStart(2, "0")}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="case-section">
          <h2>How it&apos;s built</h2>
          <ol className="case-architecture">
            {project.architecture.map((layer) => (
              <li key={layer.layer}>
                <strong>{layer.layer}</strong>
                <span>{layer.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section">
          <h2>Challenges</h2>
          <div className="case-split">
            {project.challenges.map((challenge) => (
              <article className="case-card" key={challenge.title}>
                <h3>{challenge.title}</h3>
                <p>{challenge.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="case-section case-outcome">
          <h2>Outcome</h2>
          <p className="case-lead">{project.outcome}</p>
        </section>

        <nav className="case-footer-nav" aria-label="More projects">
          <Link className="nav-cta new-ui-back-cta" href="/new-ui#featured-work">
            ← All projects
          </Link>
          <Link
            className={`case-next new-ui-art-${next.slug}`}
            href={`/new-ui/projects/${next.slug}`}
          >
            <span className="case-hero-art" aria-hidden="true" />
            <span className="case-next-copy">
              <small>Next project</small>
              <strong>{next.title} →</strong>
            </span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
