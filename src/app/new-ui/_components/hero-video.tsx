"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * The hero's background: a static photo that is always there, with the video
 * faded in over it only once it can actually play.
 *
 * - The photo (poster) renders immediately, so a slow connection still gets
 *   the full-looking hero straight away.
 * - The video starts downloading as soon as the page opens, and fades in on
 *   its first played frame. Until then — or forever, if it never arrives —
 *   the photo simply stays.
 * - On very slow connections (2G) or with the browser's Data Saver on, the
 *   video isn't requested at all: the photo is the hero.
 *
 * WHERE THE VIDEO COMES FROM: set NEXT_PUBLIC_HERO_VIDEO_URL (e.g. in
 * .env.local, and in your hosting provider's environment settings) to a
 * video hosted on a CDN or media host. Without it, the copy bundled in
 * public/video is used.
 */

const VIDEO_URL =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/video/hero-bg.mp4";
const POSTER_URL = "/video/hero-bg-poster.jpg";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function shouldSkipVideo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
  if (!connection) return false;
  return (
    connection.saveData === true ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  );
}

function subscribeMotionPreference(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Decided in the browser only (false during server rendering, so the
  // server HTML is just the photo).
  const useVideo = useSyncExternalStore(
    subscribeMotionPreference,
    () => !shouldSkipVideo(),
    () => false
  );
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!useVideo || !video) return;
    // Set both properties before play(), including Safari's initial attempt.
    // Autoplay can still be blocked by browser policy; retain the poster.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    let visible = false;
    let disposed = false;
    const syncPlayback = () => {
      if (disposed) return;
      if (!visible || document.hidden) {
        video.pause();
        return;
      }
      if (video.paused) void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    video.addEventListener("canplay", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    document.addEventListener("pointerdown", syncPlayback, { passive: true });
    document.addEventListener("keydown", syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      video.removeEventListener("canplay", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      document.removeEventListener("pointerdown", syncPlayback);
      document.removeEventListener("keydown", syncPlayback);
      video.pause();
    };
  }, [useVideo]);

  return (
    <div className="new-ui-hero-video" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative
          full-bleed background, must render before any JS runs */}
      <img className="new-ui-hero-poster" src={POSTER_URL} alt="" />
      {useVideo && (
        <video
          ref={videoRef}
          className={playing ? "is-playing" : undefined}
          src={VIDEO_URL}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onPlaying={() => setPlaying(true)}
        />
      )}
      <span className="new-ui-hero-video-overlay" />
    </div>
  );
}
