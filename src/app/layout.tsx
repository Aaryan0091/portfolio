import type { Metadata } from "next";

// Self-hosted type system (latin subset only). Loaded from node_modules, so the
// site has no third-party font request and no flash of fallback metrics.
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aaryan Gupta — Full-Stack Software Engineer",
  description:
    "Portfolio of Aaryan Gupta, a full-stack software engineer and Computer Science (AI & ML) student building web applications, browser extensions, and AI/NLP-powered products.",
};

const themeBootstrap = `(() => {
            try {
              const savedTheme = localStorage.getItem("aaryan-portfolio-theme");
              const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemTheme;
              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            } catch {
              document.documentElement.dataset.theme = "light";
              document.documentElement.style.colorScheme = "light";
            }
          })();
          // New UI loading screen: once the portfolio has fully loaded in this
          // tab, its files are cached, so later visits skip the loader
          // (page-loader.tsx). Checked here so it never even flashes.
          try {
            if (sessionStorage.getItem("new-ui-loaded")) {
              document.documentElement.classList.add("new-ui-loaded");
            }
          } catch {}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Sets the theme before first paint, so there's no flash of the
            wrong theme. A plain server-rendered <script>: next/script's
            beforeInteractive rendered it through React on the client too,
            which React reports as a script tag it will never execute. */}
        <script
          id="theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
