"use client";

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export interface TextRevealProps extends ComponentPropsWithoutRef<"section"> {
  children: string;
}

/**
 * Adapted for this portfolio from Magic UI's Text Reveal component,
 * discovered through the 21st.dev component catalog.
 */
export const TextReveal: FC<TextRevealProps> = ({
  children,
  className,
  ...props
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const words = children.trim().split(/\s+/);

  return (
    <section
      ref={sectionRef}
      className={["text-reveal", className].filter(Boolean).join(" ")}
      data-reduced-motion={prefersReducedMotion ? "true" : undefined}
      {...props}
    >
      <div className="text-reveal-sticky">
        <span className="text-reveal-label">Design principle / 01</span>
        <p className="text-reveal-copy" aria-label={children}>
          {words.map((word, index) => {
            const start = index / words.length;
            const end = start + 1 / words.length;

            return (
              <Word
                key={`${word}-${index}`}
                progress={scrollYProgress}
                range={[start, end]}
                revealImmediately={Boolean(prefersReducedMotion)}
              >
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </section>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  revealImmediately: boolean;
}

const Word: FC<WordProps> = ({
  children,
  progress,
  range,
  revealImmediately,
}) => {
  const inputRange = range[0] === 0 ? [0, range[1], 1] : [0, ...range, 1];
  const outputRange = range[0] === 0 ? [0, 1, 1] : [0, 0, 1, 1];
  const opacity = useTransform(progress, inputRange, outputRange, {
    clamp: true,
  });

  return (
    <span className="text-reveal-word" aria-hidden="true">
      <span className="text-reveal-word-ghost">{children}</span>
      <motion.span style={{ opacity: revealImmediately ? 1 : opacity }}>
        {children}
      </motion.span>
    </span>
  );
};
