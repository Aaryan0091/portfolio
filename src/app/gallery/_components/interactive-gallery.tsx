"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

/**
 * A dragging/scrolling infinite grid of images, each drawn as a Three.js plane
 * with a shader doing parallax, zoom and an RGB-split hover.
 *
 * Ported from the 3D Interactive Gallery by Arun Kumar Bind
 * (https://github.com/abx15/3d-interactive-gallery), with the following
 * changes needed to make it safe in a React/Next app:
 *
 *  - All state that was module-level globals now lives per-instance, so the
 *    component can mount more than once without two galleries sharing a
 *    scroll position.
 *  - Full teardown: both rAF loops are cancelled and every geometry, material,
 *    texture and the renderer itself are disposed. The original never cleaned
 *    up, which leaks GPU memory on every client-side navigation and doubles up
 *    under React Strict Mode's dev double-mount.
 *  - Wheel/pointer listeners are bound to the gallery element instead of
 *    `window`, so the page can still be scrolled normally around it.
 *  - `normalize-wheel` (last published 2015, no types) replaced with a small
 *    local deltaMode normalisation.
 *  - Textures are tagged SRGBColorSpace, required since three r152 changed
 *    colour management defaults — without it everything renders washed out.
 */

export interface InteractiveGalleryProps {
  images: string[];
  /** Number of columns. Each is filled with a shuffled run of `images`. */
  columns?: number;
  /**
   * How quickly the grid catches up to your input, 0–1. Lower is heavier and
   * more floaty; higher is snappier. Frame-rate corrected, so this behaves the
   * same on a 60Hz and a 144Hz display.
   */
  ease?: number;
  /**
   * Settle onto the nearest image once input stops, instead of drifting to a
   * halt wherever momentum ran out.
   */
  snap?: boolean;
  /** Milliseconds of no input before the snap kicks in. */
  snapDelay?: number;
  /** Seconds the snap glide takes. */
  snapDuration?: number;
}

const WHEEL_LINE_HEIGHT = 16;
const WHEEL_PAGE_HEIGHT = 800;

/** Turns a wheel event's deltaMode-dependent values into pixels. */
function normalizeWheel(event: WheelEvent) {
  let { deltaX, deltaY } = event;

  if (event.deltaMode === 1) {
    deltaX *= WHEEL_LINE_HEIGHT;
    deltaY *= WHEEL_LINE_HEIGHT;
  } else if (event.deltaMode === 2) {
    deltaX *= WHEEL_PAGE_HEIGHT;
    deltaY *= WHEEL_PAGE_HEIGHT;
  }

  return { pixelX: deltaX, pixelY: deltaY };
}

/**
 * Frame-rate corrected lerp.
 *
 * A plain `lerp(a, b, 0.05)` per frame moves twice as fast on a 120Hz display
 * as it does on a 60Hz one — same input, different feel, and visible micro-
 * stutter when the frame rate wobbles. Reworking the factor against elapsed
 * time makes the glide identical everywhere.
 */
const lerp = (a: number, b: number, n: number, deltaSeconds: number) =>
  a + (b - a) * (1 - Math.pow(1 - n, deltaSeconds * 60));

export function InteractiveGallery({
  images,
  columns = 6,
  ease = 0.08,
  snap = true,
  snapDelay = 140,
  snapDuration = 0.9,
}: InteractiveGalleryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    // The gallery owns the whole viewport while it's mounted. Restored on
    // unmount so navigating away doesn't leave the rest of the site unscrollable.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ---- per-instance scroll state (was a module global in the original) ----
    const scroll = {
      ease,
      scale: 3,
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      last: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    };

    const gap = 50;
    const cols = Array.from(
      root.querySelectorAll<HTMLElement>(".gallery-grid-col")
    );
    const figures = Array.from(
      root.querySelectorAll<HTMLElement>(".gallery-grid-figure")
    );
    if (cols.length === 0 || figures.length === 0) return;

    let colsBounds = cols[0].clientWidth + gap;
    let wrapSizeX = colsBounds * cols.length;
    // One grid cell. Snapping rounds the scroll target to a multiple of these,
    // which lands an image square in the middle rather than halfway off-screen.
    let itemBounds = figures[0].clientHeight + gap;

    const layoutColumns = (scrollX: number) => {
      gsap.set(cols, {
        x: (i: number) => i * colsBounds + scrollX,
        modifiers: {
          x: (x: string) =>
            `${gsap.utils.wrap(-colsBounds, wrapSizeX - colsBounds, Number.parseFloat(x))}px`,
        },
      });
    };

    const layoutColumnItems = (column: HTMLElement, scrollY: number) => {
      const items = Array.from(
        column.querySelectorAll<HTMLElement>(".gallery-grid-figure")
      );
      if (items.length === 0) return;

      const wrapSizeY = itemBounds * items.length;

      gsap.set(items, {
        y: (i: number) => i * itemBounds + scrollY,
        modifiers: {
          y: (y: string) =>
            `${gsap.utils.wrap(-itemBounds, wrapSizeY - itemBounds, Number.parseFloat(y))}px`,
        },
      });
    };

    // ---------------------------- input ----------------------------
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // ---- settle-to-nearest-image when input stops ----
    // Without this the grid just coasts to a stop wherever momentum ran out,
    // usually with images cut in half at the screen edge. Instead: once no
    // input has arrived for `snapDelay`, glide the target to the nearest whole
    // grid cell. Snapping the *target* (not the current position) means the
    // existing lerp carries it there, so the two never fight.
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let snapTween: gsap.core.Tween | undefined;

    const cancelSnap = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = undefined;
      snapTween?.kill();
      snapTween = undefined;
    };

    const scheduleSnap = () => {
      if (!snap || prefersReducedMotion) return;
      cancelSnap();
      idleTimer = setTimeout(() => {
        if (isDragging) return;
        snapTween = gsap.to(scroll.target, {
          x: Math.round(scroll.target.x / colsBounds) * colsBounds,
          y: Math.round(scroll.target.y / itemBounds) * itemBounds,
          duration: snapDuration,
          ease: "power3.out",
          overwrite: true,
        });
      }, snapDelay);
    };

    const onWheel = (event: WheelEvent) => {
      cancelSnap();
      const { pixelX, pixelY } = normalizeWheel(event);
      scroll.target.x -= pixelX * scroll.scale;
      scroll.target.y -= pixelY * scroll.scale;
      scheduleSnap();
    };

    const pointerXY = (event: MouseEvent | TouchEvent) =>
      "touches" in event
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : { x: event.clientX, y: event.clientY };

    const onDragStart = (event: MouseEvent | TouchEvent) => {
      cancelSnap();
      isDragging = true;
      scroll.position.x = scroll.current.x;
      scroll.position.y = scroll.current.y;
      const { x, y } = pointerXY(event);
      startX = x;
      startY = y;
      root.classList.add("is-dragging");
    };

    const onDragMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const { x, y } = pointerXY(event);
      scroll.target.x = scroll.position.x + (x - startX) * scroll.scale;
      scroll.target.y = scroll.position.y + (y - startY) * scroll.scale;
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      root.classList.remove("is-dragging");
      scheduleSnap();
    };

    // Bound to the gallery element, not `window` — the original hijacked every
    // wheel event on the page, which would fight anything else that scrolls.
    root.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("touchstart", onDragStart, { passive: true });
    root.addEventListener("touchmove", onDragMove, { passive: true });
    root.addEventListener("touchend", onDragEnd, { passive: true });
    root.addEventListener("mousedown", onDragStart);
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);

    // ---------------------------- three.js ----------------------------
    const perspective = 1000;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.sortObjects = false;
    renderer.setSize(window.innerWidth, window.innerHeight);

    const fov =
      (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
    const camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      1,
      perspective
    );
    camera.position.set(0, 0, perspective);

    const textureLoader = new THREE.TextureLoader();

    interface Plane {
      element: HTMLElement;
      image: HTMLImageElement;
      mesh: THREE.Mesh;
      geometry: THREE.PlaneGeometry;
      material: THREE.ShaderMaterial;
      texture: THREE.Texture;
      uniforms: Record<string, { value: unknown }>;
      onEnter: () => void;
      onLeave: () => void;
    }

    const planes: Plane[] = figures
      .map((element): Plane | null => {
        const image = element.querySelector("img");
        if (!image) return null;

        const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
        const texture = textureLoader.load(image.src);
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        // Required since three r152 — without it the images render washed out.
        texture.colorSpace = THREE.SRGBColorSpace;

        const uniforms = {
          uTexture: { value: texture },
          uOffset: { value: new THREE.Vector2(0, 0) },
          uAlpha: { value: 1 },
          uPlaneSizes: { value: [0, 0] },
          uImageSizes: { value: [0, 0] },
          uZoom: { value: 0.85 },
          uParallax: { value: new THREE.Vector2(0, 0) },
          uStrength: { value: new THREE.Vector2(0, 0) },
          uViewportSizes: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          uHover: { value: 0 },
        };

        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: galleryVertexShader,
          fragmentShader: galleryFragmentShader,
          transparent: true,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const onEnter = () => {
          gsap.to(uniforms.uHover, { value: 1, duration: 0.6, ease: "power3.out" });
        };
        const onLeave = () => {
          gsap.to(uniforms.uHover, { value: 0, duration: 0.6, ease: "power3.out" });
        };
        element.addEventListener("mouseenter", onEnter);
        element.addEventListener("mouseleave", onLeave);

        return {
          element,
          image,
          mesh,
          geometry,
          material,
          texture,
          uniforms,
          onEnter,
          onLeave,
        };
      })
      .filter((plane): plane is Plane => plane !== null);

    const onResize = () => {
      colsBounds = cols[0].clientWidth + gap;
      wrapSizeX = colsBounds * cols.length;
      itemBounds = figures[0].clientHeight + gap;
      layoutColumns(scroll.current.x);

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      planes.forEach((plane) => {
        (plane.uniforms.uViewportSizes.value as THREE.Vector2).set(
          window.innerWidth,
          window.innerHeight
        );
      });
    };
    window.addEventListener("resize", onResize);

    // ---------------------------- render loop ----------------------------
    // One loop, not the original's two competing ones.
    let frameId = 0;
    let lastTime = performance.now();

    layoutColumns(0);

    const render = () => {
      const now = performance.now();
      // Clamped so a backgrounded tab returning after seconds doesn't teleport
      // the grid on its first frame back.
      const deltaSeconds = Math.min((now - lastTime) / 1000, 1 / 20);
      lastTime = now;

      scroll.current.x = lerp(scroll.current.x, scroll.target.x, scroll.ease, deltaSeconds);
      scroll.current.y = lerp(scroll.current.y, scroll.target.y, scroll.ease, deltaSeconds);

      layoutColumns(scroll.current.x);
      cols.forEach((column, i) => {
        layoutColumnItems(column, scroll.current.y + i * 100);
      });

      scroll.last.x = scroll.current.x;
      scroll.last.y = scroll.current.y;

      planes.forEach((plane) => {
        const rect = plane.image.getBoundingClientRect();
        plane.mesh.position.set(
          rect.left - window.innerWidth / 2 + rect.width / 2,
          -rect.top + window.innerHeight / 2 - rect.height / 2,
          1
        );
        plane.mesh.scale.set(rect.width, rect.height, 1);

        plane.uniforms.uImageSizes.value = [
          plane.image.naturalWidth || rect.width,
          plane.image.naturalHeight || rect.height,
        ];
        plane.uniforms.uPlaneSizes.value = [rect.width, rect.height];

        const pivX = (plane.mesh.position.x - scroll.current.x / 100) * 0.05;
        const pivY = (plane.mesh.position.y - scroll.current.y / 100) * 0.05;
        (plane.uniforms.uParallax.value as THREE.Vector2).set(
          gsap.utils.mapRange(-1.15, 1.15, -0.005, 0.01, pivX),
          gsap.utils.mapRange(-1.15, 1.15, -0.005, 0.01, pivY)
        );

        (plane.uniforms.uStrength.value as THREE.Vector2).set(
          Math.abs((scroll.target.x - scroll.current.x) * 0.15),
          Math.abs((scroll.target.y - scroll.current.y) * 0.15)
        );
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    if (prefersReducedMotion) {
      // Lay the grid out and draw a single static frame — no drift, no loop.
      scroll.ease = 1;
      render();
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else {
      frameId = requestAnimationFrame(render);
    }

    // ---------------------------- teardown ----------------------------
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      cancelSnap();

      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onDragStart);
      root.removeEventListener("touchmove", onDragMove);
      root.removeEventListener("touchend", onDragEnd);
      root.removeEventListener("mousedown", onDragStart);
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("resize", onResize);

      planes.forEach((plane) => {
        plane.element.removeEventListener("mouseenter", plane.onEnter);
        plane.element.removeEventListener("mouseleave", plane.onLeave);
        gsap.killTweensOf(plane.uniforms.uHover);
        scene.remove(plane.mesh);
        plane.geometry.dispose();
        plane.material.dispose();
        plane.texture.dispose();
      });

      renderer.dispose();
      document.body.style.overflow = previousOverflow;
    };
  }, [images, columns, ease, snap, snapDelay, snapDuration]);

  return (
    <div className="gallery-stage" ref={rootRef}>
      <canvas className="gallery-canvas" ref={canvasRef} />

      <div className="gallery-grid" aria-hidden="true">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div className="gallery-grid-col" key={colIndex}>
            {images.map((src, imageIndex) => {
              // Offset each column's starting image so neighbouring columns
              // don't show the same picture side by side.
              const offset = (imageIndex + colIndex * 5) % images.length;
              return (
                <figure className="gallery-grid-figure" key={`${colIndex}-${imageIndex}`}>
                  {/* Plain <img>, not next/image: the DOM node exists purely to
                      be measured and to provide a texture source. It is never
                      painted (CSS hides it) — three.js draws the pixels. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[offset]} alt="" className="gallery-grid-image" />
                </figure>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
