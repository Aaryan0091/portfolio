import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aaryan Gupta — Full-Stack Software Engineer",
  description:
    "Portfolio of Aaryan Gupta, a full-stack software engineer and Computer Science (AI & ML) student building web applications, browser extensions, and AI/NLP-powered products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`(() => {
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
          })();`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
