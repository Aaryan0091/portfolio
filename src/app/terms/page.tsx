import Link from "next/link";
import "@fontsource/lobster/latin-400.css";
import { BackgroundLines } from "../new-ui/_components/background-lines";
import { ReturnLink } from "../new-ui/_components/return-link";

export const metadata = {
  title: "Terms and Conditions — Aaryan Gupta",
  description:
    "The terms for using Aaryan Gupta's portfolio website, its contact form and its Ask AI assistant.",
};

const LAST_UPDATED = "7th Oct 2026";
const EMAIL = "aaryangupta2005@gmail.com";

/** Section ids double as the table of contents. */
const sections = [
  { id: "about", title: "About this site" },
  { id: "ownership", title: "Ownership of content" },
  { id: "using", title: "Using the content" },
  { id: "projects", title: "Projects, demos and source code" },
  { id: "contact-form", title: "The contact form" },
  { id: "ask-ai", title: "The Ask AI assistant" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "third-parties", title: "Third-party links and images" },
  { id: "no-offer", title: "No offer or professional advice" },
  { id: "warranty", title: "No warranty" },
  { id: "liability", title: "Limitation of liability" },
  { id: "changes", title: "Changes to these terms" },
  { id: "law", title: "Governing law" },
  { id: "contact", title: "Contact" },
];

/**
 * Terms and Conditions, in the New UI's look: dark teal backdrop with the
 * glowing lines, a Lobster heading, a table of contents and numbered,
 * plain-English sections.
 */
export default function TermsPage() {
  return (
    <main className="new-ui-page legal-v2">
      <div className="new-ui-backdrop" aria-hidden="true">
        <span className="new-ui-glow" />
        <BackgroundLines />
      </div>

      <header className="ask-ai-bar legal-bar">
        <ReturnLink className="nav-cta new-ui-back-cta">← Back to portfolio</ReturnLink>
        <ReturnLink className="ask-ai-brand" aria-label="Aaryan Gupta, back to portfolio">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo */}
          <img className="new-ui-logo" src="/logo-a.png" alt="" />
        </ReturnLink>
      </header>

      <div className="legal-hero">
        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-title">Terms &amp; Conditions</h1>
        <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        <p className="legal-summary">
          The short version: this is my personal portfolio. Look around, get
          in touch, and ask the assistant anything about my work. Please
          don&apos;t copy my work as your own or misuse the contact form or
          the assistant. The details are below.
        </p>
      </div>

      <div className="legal-layout">
        <nav className="legal-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-body">
          <section id="about">
            <h2>About this site</h2>
            <p>
              This website is the personal portfolio of Aaryan Gupta, a
              full-stack software engineer based in Faridabad, Haryana,
              India. It showcases my projects, skills and experience, and lets
              you contact me. By using the site you agree to these terms. If
              you don&apos;t agree, please don&apos;t use it.
            </p>
          </section>

          <section id="ownership">
            <h2>Ownership of content</h2>
            <p>
              Unless stated otherwise, the writing, project write-ups and
              photographs of me on this site are my own and belong to me.
              Project cover images and other artwork are used for presentation
              only. Names, logos and trademarks of other
              companies and products belong to their owners and are used only
              to describe the technologies I work with.
            </p>
          </section>

          <section id="using">
            <h2>Using the content</h2>
            <p>You&apos;re welcome to:</p>
            <ul>
              <li>browse the site and share links to it;</li>
              <li>
                quote short parts of it with a credit and a link back, for
                example in a review, article or recommendation;
              </li>
              <li>
                use it to evaluate me for a role, project or collaboration.
              </li>
            </ul>
            <p>
              Please don&apos;t copy the site&apos;s text or images
              wholesale, present my projects or write-ups as your own, or use
              the content to train or build commercial products without my
              permission.
            </p>
          </section>

          <section id="projects">
            <h2>Projects, demos and source code</h2>
            <p>
              Project pages describe what I built and may link to live demos
              and to source code on GitHub. Live demos are provided for you to
              try and may change, be reset or be taken down at any time; please
              don&apos;t enter real sensitive information into them. Source
              code on GitHub is governed by the licence in each repository —
              where a repository has no licence, all rights are reserved.
            </p>
          </section>

          <section id="contact-form">
            <h2>The contact form</h2>
            <p>
              The &ldquo;Got an Idea?&rdquo; form sends your name, email
              address and message to me by email, through an email delivery
              service. Please only send information you&apos;re comfortable
              sharing, and don&apos;t use the form to send spam, advertising
              or anything unlawful. Sending a message doesn&apos;t create any
              agreement between us — any work together would be agreed
              separately. How your details are handled is explained in the{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </section>

          <section id="ask-ai">
            <h2>The Ask AI assistant</h2>
            <p>
              The Ask AI page answers questions about me and my work using an
              AI language model run by a third-party provider. It&apos;s told
              to answer only from information on this portfolio, but AI can
              still make mistakes, so its answers are a helpful summary, not a
              statement from me — please confirm anything important with me
              directly.
            </p>
            <p>
              Your questions are sent to the AI provider to generate answers,
              so don&apos;t include personal or confidential information in
              them. Usage is limited per visitor to keep the service fair, and
              when the limit is reached or the AI is unavailable, the page
              shows an availability notice and asks you to try again.
            </p>
          </section>

          <section id="acceptable-use">
            <h2>Acceptable use</h2>
            <p>When using this site, please don&apos;t:</p>
            <ul>
              <li>
                try to break, overload, scrape at scale or gain unauthorised
                access to the site or the services behind it;
              </li>
              <li>
                send automated or bulk requests to the contact form or the
                Ask AI assistant, or try to make the assistant ignore its
                instructions;
              </li>
              <li>use the site for anything unlawful, abusive or harmful.</li>
            </ul>
            <p>
              I may block access for anyone who misuses the site.
            </p>
          </section>

          <section id="third-parties">
            <h2>Third-party links and images</h2>
            <p>
              The site links to other websites — such as GitHub, LinkedIn,
              LeetCode, live project demos and the documentation referenced in
              the Insights section — and shows those pages&apos; own preview
              images. Those sites are run by others; I&apos;m not responsible
              for their content, availability or privacy practices, and
              linking to them isn&apos;t an endorsement.
            </p>
          </section>

          <section id="no-offer">
            <h2>No offer or professional advice</h2>
            <p>
              Nothing on this site is an offer, quotation or contract for
              services, or professional, legal or financial advice. Insights
              and write-ups share my own experience and opinions, for general
              information.
            </p>
          </section>

          <section id="warranty">
            <h2>No warranty</h2>
            <p>
              I work to keep the site accurate and running, but it&apos;s
              provided &ldquo;as is&rdquo;, without warranties of any kind. I
              can&apos;t promise that it will always be available, error-free
              or up to date.
            </p>
          </section>

          <section id="liability">
            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent the law allows, I&apos;m not liable for
              any loss or damage arising from your use of this site, the
              assistant&apos;s answers, live demos or linked third-party
              sites. Nothing in these terms limits any liability that cannot
              be limited by law.
            </p>
          </section>

          <section id="changes">
            <h2>Changes to these terms</h2>
            <p>
              I may update these terms from time to time — for example when I
              add features to the site. The date at the top shows when they
              last changed, and continuing to use the site after a change
              means you accept the updated terms.
            </p>
          </section>

          <section id="law">
            <h2>Governing law</h2>
            <p>
              These terms are governed by the laws of India, and any disputes
              will be handled by the courts of Haryana, India.
            </p>
          </section>

          <section id="contact">
            <h2>Contact</h2>
            <p>
              Questions about these terms? Email{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or use the{" "}
              <Link href="/#contact">contact form</Link>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
