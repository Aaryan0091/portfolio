/**
 * Case-study content for each project's detail page
 * (/new-ui/projects/[slug]). The cover image and colour come from the same
 * `.new-ui-art-<slug>` class the Featured Work tiles use (globals.css).
 */

export type ProjectDetail = {
  slug: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  summary: string;
  problem: string;
  solution: string;
  features: Array<{ title: string; body: string }>;
  architecture: Array<{ layer: string; detail: string }>;
  challenges: Array<{ title: string; body: string }>;
  outcome: string;
  stack: string[];
  /** Source code on GitHub, when public. */
  repo?: string;
  /** The live, deployed project, when there is one. */
  live?: string;
};

export const projectDetails: ProjectDetail[] = [
  {
    slug: "skillchain",
    number: "01",
    title: "SkillChain",
    category: "AI / NLP · Blockchain",
    tagline: "AI developer verification, anchored on-chain",
    summary:
      "An AI-powered developer verification platform that analyses GitHub repositories, generates skill scores, and anchors certificates on-chain — so a developer's real work becomes evidence a recruiter can trust.",
    problem:
      "Résumés list skills, but they don't prove them. Recruiters can't read through dozens of repositories per candidate, and self-reported skill lists are easy to inflate. Public repository activity holds the real signal, but it is unstructured and hard to compare.",
    solution:
      "SkillChain turns public repository activity into structured, recruiter-friendly evidence. It analyses a developer's GitHub work, scores their skills with NLP, and issues a certificate whose record lives on the blockchain — so it can be verified independently and can't be quietly edited.",
    features: [
      {
        title: "Repository analysis",
        body: "Pulls a developer's public repositories through the GitHub API and reads languages, frameworks, and project structure to understand what they actually build.",
      },
      {
        title: "NLP skill scoring",
        body: "Natural-language processing over READMEs, code, and commit history turns raw activity into scores per skill area.",
      },
      {
        title: "Recruiter workflows",
        body: "A view built for evaluation: compare candidates, see the evidence behind each score, and shortlist from verified data.",
      },
      {
        title: "On-chain certificates",
        body: "Skill certificates are anchored with a Solidity smart contract on Polygon, so anyone can verify them without trusting a central database.",
      },
    ],
    architecture: [
      { layer: "Data", detail: "GitHub API for repositories, languages, and commit history." },
      { layer: "Intelligence", detail: "NLP pipeline that extracts skills and produces per-area scores." },
      { layer: "Verification", detail: "Solidity smart contract on Polygon Amoy, called through Ethers.js." },
      { layer: "Interface", detail: "Developer and recruiter dashboards for scores, evidence, and certificates." },
    ],
    challenges: [
      {
        title: "Fair scoring from noisy data",
        body: "Repositories vary hugely in size and quality, so scoring had to weigh real contribution rather than raw volume.",
      },
      {
        title: "Trust without a middleman",
        body: "Putting the certificate record on-chain means verification doesn't depend on SkillChain staying online or honest.",
      },
    ],
    outcome:
      "A working pipeline from GitHub profile to verified, on-chain skill certificate — combining AI analysis with blockchain verification in one product.",
    stack: ["GitHub API", "NLP", "Solidity", "Ethers.js", "Polygon Amoy"],
    live: "https://skillchain.aaryn.me/",
  },
  {
    slug: "workstack",
    number: "02",
    title: "Work-Stack",
    category: "Full-stack · Chrome extension",
    tagline: "Productivity and semantic bookmark platform",
    summary:
      "An AI-powered productivity and bookmark platform for organising knowledge, tracking activity, and collaborating — from the web app or straight from the browser through its companion Chrome extension.",
    problem:
      "Useful links, notes, and tasks end up scattered across browser tabs, bookmark folders, and chat messages. Finding something again usually means remembering the exact title or folder it was saved under.",
    solution:
      "Work-Stack brings bookmarks, tasks, and browsing activity into one place, and makes them searchable by meaning rather than exact words. A Chrome extension saves things in one click, and collections can be shared with others.",
    features: [
      {
        title: "Semantic search",
        body: "Find a saved page by describing it — search understands meaning, not just matching keywords.",
      },
      {
        title: "AI-assisted organisation",
        body: "New items are sorted and tagged automatically, so the library stays tidy without manual filing.",
      },
      {
        title: "Activity tracking",
        body: "See what you've saved and worked on over time, to pick up where you left off.",
      },
      {
        title: "Collaborative collections",
        body: "Share curated collections with teammates or friends and build them together.",
      },
      {
        title: "Companion Chrome extension",
        body: "Save from any page in one click, with its own authentication and session restore so it stays signed in reliably.",
      },
    ],
    architecture: [
      { layer: "Frontend", detail: "React web app for browsing, searching, and managing collections." },
      { layer: "Backend & auth", detail: "Supabase for authentication, storage, and real-time data." },
      { layer: "Database", detail: "PostgreSQL holding bookmarks, collections, and activity." },
      { layer: "Search", detail: "NLP-based semantic search over saved content." },
      { layer: "Extension", detail: "Chrome extension with independent auth and session restore." },
    ],
    challenges: [
      {
        title: "Two clients, one account",
        body: "The web app and extension authenticate separately, so sessions had to stay in sync and restore cleanly after the browser restarts.",
      },
      {
        title: "Search that understands intent",
        body: "Keyword search fails when you can't remember a title; semantic search had to return the right page from a vague description.",
      },
    ],
    outcome:
      "A single home for scattered knowledge that you can search by meaning, organise automatically, and reach from anywhere in the browser.",
    stack: ["React", "Supabase", "PostgreSQL", "Chrome extension", "NLP"],
    live: "https://workstack.aaryn.me/",
  },
  {
    slug: "soulvoyage",
    number: "03",
    title: "Soul-Voyage",
    category: "Realtime · WebGL",
    tagline: "Real-time geospatial web experience",
    summary:
      "A real-time web application that combines live location data with an interactive 3D globe, updating every connected session the moment something changes.",
    problem:
      "Location sharing is usually a flat map that refreshes now and then. It doesn't feel shared or alive, and updates from one person don't reach everyone else instantly.",
    solution:
      "Soul-Voyage turns live location updates into a shared, interactive experience on a WebGL globe. Events flow over WebSockets, so every authenticated session sees changes as they happen.",
    features: [
      {
        title: "Interactive 3D globe",
        body: "Live locations rendered on a WebGL Earth you can spin and zoom.",
      },
      {
        title: "Real-time updates",
        body: "WebSocket events push changes to every open session instantly — no refreshing.",
      },
      {
        title: "Cross-session sync",
        body: "Event-driven synchronisation keeps every user's view consistent with shared, Firebase-backed state.",
      },
      {
        title: "Secure sign-in",
        body: "Google OAuth 2.0 authentication, so sessions belong to real, signed-in users.",
      },
    ],
    architecture: [
      { layer: "Frontend", detail: "React app rendering the WebGL Earth globe." },
      { layer: "Realtime", detail: "WebSocket events for instant, cross-session updates." },
      { layer: "State", detail: "Firebase-backed shared state as the source of truth." },
      { layer: "Auth", detail: "Google OAuth 2.0 sign-in." },
    ],
    challenges: [
      {
        title: "Keeping every view in sync",
        body: "Several sessions update the same shared state, so events had to be ordered and applied consistently everywhere.",
      },
      {
        title: "Smooth 3D in the browser",
        body: "Rendering a live globe with WebGL while data streams in meant keeping updates light enough to stay smooth.",
      },
    ],
    outcome:
      "A live, shared geographic experience in the browser — real-time data, a 3D globe, and authenticated sessions working together.",
    stack: ["React", "Firebase", "WebSockets", "WebGL Earth", "Google OAuth 2.0"],
  },
  {
    slug: "blinkflow",
    number: "04",
    title: "BlinkFlow",
    category: "Desktop app · Electron",
    tagline: "Privacy-first 20-20-20 eye-care timer",
    summary:
      "A privacy-first desktop timer that applies the 20-20-20 eye-care rule without interrupting focused work. After a chosen focus interval it starts an adjustable rest, plays a calm local chime, and can show a dedicated rest screen on the main display or every connected display — fully offline, with all data stored locally.",
    problem:
      "Long stretches at a screen strain your eyes, and the 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds) is easy to forget. Most break reminders are either easy to ignore or so intrusive they break your focus — and many collect usage data in the cloud.",
    solution:
      "BlinkFlow runs quietly while you work, then guides a short rest at the right moment: a gentle chime and an optional fullscreen rest screen that covers no displays, the main one, or all of them. It works offline, has no accounts or telemetry, and keeps every setting on your machine.",
    features: [
      {
        title: "Flexible focus & rest",
        body: "Focus intervals from 1 to 120 minutes and rests from 5 to 120 seconds, with an Auto Mode for continuous cycles.",
      },
      {
        title: "Eye-shaped progress control",
        body: "Drag the eye-shaped dial to adjust elapsed or remaining time on the fly.",
      },
      {
        title: "Multi-display rest screens",
        body: "Fullscreen rest overlays on no screens, the main display, or every display — in Ambient, Pitch black, or Black + timer styles.",
      },
      {
        title: "Screen-time stats",
        body: "Tracks total screen time, eye-rest time, and completed rests, and leaves laptop sleep out of screen time.",
      },
      {
        title: "Tray & keyboard control",
        body: "System-tray controls while hidden, launch at login, and shortcuts — Space, R, S, and Escape.",
      },
      {
        title: "Restores after restarts",
        body: "Timestamped timer snapshots, written atomically, so a session resumes correctly after the app restarts.",
      },
    ],
    architecture: [
      { layer: "Interface", detail: "React and TypeScript renderer built with Vite, with local fonts and no remote dependencies." },
      { layer: "Desktop shell", detail: "Electron main process running the timer engine, tray, displays, and persistence." },
      { layer: "Shared contract", detail: "One timer-state contract shared by Electron and React, over validated IPC." },
      { layer: "Storage", detail: "Local JSON snapshot in the app's data folder plus local-storage preferences — nothing in the cloud." },
      { layer: "Security", detail: "Sandboxed renderers, a restrictive CSP, blocked navigation, and locked production Electron fuses." },
      { layer: "Delivery", detail: "CI on Ubuntu, macOS, and Windows; packaged as DMG/ZIP, an NSIS installer, and an AppImage." },
    ],
    challenges: [
      {
        title: "Accurate time through sleep and restarts",
        body: "Laptop sleep shouldn't count as screen time, and a restart shouldn't lose the session — handled with sleep/wake events and timestamped, atomically written snapshots.",
      },
      {
        title: "Locking down a desktop app",
        body: "Electron apps can expose a lot; BlinkFlow sandboxes renderers, validates every IPC call, blocks navigation, and locks Electron fuses in every packaged build.",
      },
    ],
    outcome:
      "A cross-platform, offline eye-care companion that protects your eyes without breaking your focus — with a full test suite and CI on all three desktop platforms.",
    stack: ["React", "TypeScript", "Vite", "Electron", "Node.js"],
    repo: "https://github.com/Aaryan0091/BlinkFLow",
  },
  {
    slug: "csm-order-tracker",
    number: "05",
    title: "CSM Order Tracker",
    category: "Full-stack · Realtime",
    tagline: "Factory order tracking across departments",
    summary:
      "An order-management web app for CSM Engineers that tracks factory orders as they move between departments — Sales, Design, Procurement, Production, QC, and Dispatch — with live updates, role-based access, and a full activity history.",
    problem:
      "In a factory, an order passes through many hands. When its status lives in spreadsheets and phone calls, departments work from stale information, it's unclear who changed what, and giving the right people the right access is hard.",
    solution:
      "One shared dashboard where every department sees orders update live. Each change is recorded with who made it and when, staff sign in with department roles, and admin rights are granted securely through Firebase custom claims rather than a public sign-up option.",
    features: [
      {
        title: "Live order updates",
        body: "The dashboard subscribes to Firestore, so changes by other employees appear instantly — no refreshing.",
      },
      {
        title: "Department roles",
        body: "Sign-in by department (Sales, Design, Procurement, Production, QC, Dispatch), with admin kept off public sign-up.",
      },
      {
        title: "Immutable activity log",
        body: "Every create or update is committed atomically with an activity entry: actor, department, change summary, and server timestamp.",
      },
      {
        title: "Filters & stats",
        body: "Dashboard header, filters, stats, and banners to find and follow orders quickly.",
      },
      {
        title: "Secure admin access",
        body: "Admins are verified through Firebase custom claims (admin: true) on the ID token, set from a privileged script.",
      },
      {
        title: "Production operations",
        body: "Vercel Analytics and Speed Insights, optional App Check, and weekly automated Firestore backups.",
      },
    ],
    architecture: [
      { layer: "Frontend", detail: "React + TypeScript app built with Vite: auth screens, dashboard, and order modals loaded on demand." },
      { layer: "Auth", detail: "Firebase Authentication with email/password and custom claims for admins." },
      { layer: "Data", detail: "Cloud Firestore for users, orders, and the activity history, with live listeners." },
      { layer: "Services", detail: "Firebase access isolated in a small services layer for auth, orders, and users." },
      { layer: "Operations", detail: "Vercel hosting and analytics, plus a GitHub Actions workflow for weekly Firestore backups." },
    ],
    challenges: [
      {
        title: "Trustworthy history",
        body: "Writing the order change and its activity entry in one atomic commit means the log can never disagree with the data.",
      },
      {
        title: "Real admin security on a free plan",
        body: "Without paid Cloud Functions, admin approval is a verified manual step that sets a custom claim — secure without exposing an admin sign-up.",
      },
    ],
    outcome:
      "A live, auditable order pipeline that keeps every department on the same page, built for real day-to-day use in a factory.",
    stack: ["React", "TypeScript", "Vite", "Firebase Auth", "Cloud Firestore", "Vercel"],
    repo: "https://github.com/Aaryan0091/CSM_OI_Transit",
  },
  {
    slug: "matchmyresume",
    number: "06",
    title: "MatchMyResume",
    category: "AI / NLP · Full-stack",
    tagline: "NLP résumé analyser against job descriptions",
    summary:
      "An NLP-based web app that analyses a résumé against a job description and gives actionable insights: a match score, the skills you have, the skills you're missing, and suggestions to improve.",
    problem:
      "Applicants rarely know how well their résumé fits a specific job, and many get filtered out for missing keywords and skills before a person ever reads them.",
    solution:
      "Upload a PDF résumé and paste the job description. MatchMyResume extracts the text, finds skills with NLP, compares the two documents, and returns a 0–100% match score with matched skills, missing skills, and concrete suggestions.",
    features: [
      {
        title: "PDF upload",
        body: "Drag and drop a PDF résumé; its text is extracted with pdfplumber.",
      },
      {
        title: "Match score",
        body: "TF-IDF vectors and cosine similarity produce a 0–100% match score, shown as a donut chart.",
      },
      {
        title: "Skill extraction",
        body: "spaCy named-entity recognition plus a custom skills database find the skills in both documents.",
      },
      {
        title: "Matched vs missing",
        body: "Green badges for skills you have, red badges for the ones the job asks for that you don't.",
      },
      {
        title: "Improvement suggestions",
        body: "Actionable tips for closing the gap between your résumé and the role.",
      },
      {
        title: "Analysis history",
        body: "Past analyses are saved to Supabase so you can compare versions over time.",
      },
    ],
    architecture: [
      { layer: "Frontend", detail: "React 18 + TypeScript with Tailwind CSS, Recharts, and Axios, built with Vite." },
      { layer: "API", detail: "FastAPI backend exposing the analysis endpoint, with CORS configured for the frontend." },
      { layer: "NLP pipeline", detail: "pdfplumber for extraction, NLTK for preprocessing, spaCy for NER, scikit-learn for TF-IDF similarity." },
      { layer: "Skills data", detail: "A custom skills database for broad, reliable coverage." },
      { layer: "History", detail: "Optional Supabase (PostgreSQL) table storing scores, skills, and suggestions." },
    ],
    challenges: [
      {
        title: "Finding skills in free text",
        body: "Résumés phrase skills in many ways, so NER is combined with a curated skills list to catch what each method misses alone.",
      },
      {
        title: "A score people can trust",
        body: "Text is cleaned (tokens, stop words, punctuation) before TF-IDF comparison, so the score reflects real overlap rather than noise.",
      },
    ],
    outcome:
      "A practical tool that shows job seekers exactly where their résumé falls short for a role — and what to do about it.",
    stack: ["React", "TypeScript", "Tailwind CSS", "Python", "FastAPI", "spaCy", "NLTK", "scikit-learn", "Supabase"],
    repo: "https://github.com/Aaryan0091/MatchMyResume",
  },
  {
    slug: "focus-tide",
    number: "07",
    title: "Focus Tide",
    category: "Web app · Productivity",
    tagline: "Pomodoro timer with ambient soundscapes",
    summary:
      "A Pomodoro timer with ambient sounds: focus and break sessions paired with calming rain and soft background audio, animated rain and particle backdrops, and settings that persist between visits.",
    problem:
      "Staying focused for long stretches is hard, and a bare countdown does little to help you settle in — while switching between a timer and a separate ambient-sound app adds friction.",
    solution:
      "Focus Tide puts the timer and the atmosphere in one place: start a focus session and calming audio begins; take a break and the mood shifts; a chime marks the end of each session, across a four-session cycle.",
    features: [
      {
        title: "Focus & break modes",
        body: "Classic Pomodoro cycles with adjustable focus and break lengths, tracked across four sessions.",
      },
      {
        title: "Ambient soundscapes",
        body: "Rain and soft ambient tracks that play during sessions, with a volume slider and mute toggle.",
      },
      {
        title: "Animated backdrops",
        body: "Falling rain and drifting particles that set the mood for each mode.",
      },
      {
        title: "Session chime",
        body: "A gentle chime when a focus session ends and break mode is ready.",
      },
      {
        title: "Keyboard shortcuts",
        body: "Space to start or pause, R to reset.",
      },
      {
        title: "Remembers your settings",
        body: "Durations, volume, sound preference, and session progress are saved in local storage.",
      },
    ],
    architecture: [
      { layer: "Interface", detail: "Plain HTML, CSS, and JavaScript, bundled with Vite." },
      { layer: "Timer", detail: "A page controller that drives focus/break state, rendering, and shortcuts." },
      { layer: "Audio", detail: "A small ambient-audio module for looping rain and soft tracks, volume, and the chime." },
      { layer: "Storage", detail: "Local storage for durations, volume, sound on/off, and the session count." },
    ],
    challenges: [
      {
        title: "Audio that behaves",
        body: "Ambient tracks have to start, pause, stop, and switch with the timer's state without overlapping or jumping.",
      },
      {
        title: "Accessible by default",
        body: "Mode changes are announced for screen readers, and the controls carry proper labels and pressed states.",
      },
    ],
    outcome:
      "A calm, self-contained focus tool that pairs the Pomodoro technique with ambience — no sign-up, no setup, just press Space.",
    stack: ["JavaScript", "HTML", "CSS", "Vite", "Web Audio"],
    repo: "https://github.com/Aaryan0091/Focus-Tide",
  },
];

export function getProjectDetail(slug: string) {
  return projectDetails.find((project) => project.slug === slug);
}
