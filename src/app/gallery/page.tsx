import Link from "next/link";
import { InteractiveGallery } from "./_components/interactive-gallery";

export const metadata = {
  title: "Gallery — Aaryan Gupta",
  description:
    "An interactive WebGL gallery: an infinite draggable grid of images rendered as shader-driven planes.",
};

const galleryImages = Array.from(
  { length: 15 },
  (_, index) => `/gallery/${String(index + 1).padStart(2, "0")}.jpg`
);

export default function GalleryPage() {
  return (
    <main className="gallery-page">
      <InteractiveGallery images={galleryImages} />

      <header className="gallery-overlay gallery-overlay-top">
        <Link className="gallery-back" href="/new-ui">
          ← Back to portfolio
        </Link>
        <p className="gallery-hint">Drag or scroll in any direction</p>
      </header>

      <footer className="gallery-overlay gallery-overlay-bottom">
        <p className="gallery-credit">
          WebGL gallery effect adapted from{" "}
          <a
            href="https://github.com/abx15/3d-interactive-gallery"
            target="_blank"
            rel="noopener noreferrer"
          >
            3D Interactive Gallery
          </a>{" "}
          by{" "}
          <a
            href="https://github.com/abx15"
            target="_blank"
            rel="noopener noreferrer"
          >
            Arun Kumar Bind
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
