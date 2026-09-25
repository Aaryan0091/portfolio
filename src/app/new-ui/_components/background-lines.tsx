/**
 * The vertical guide lines behind the New UI, each with glowing streaks of
 * light running along it (styles: `.new-ui-lines` / `.new-ui-line-pulse` in
 * globals.css). Used by the main page and the 404 page.
 *
 * Each streak crosses the line's whole length in 8–14s. On the main page a
 * line is as tall as the entire page, so with only one streak per line any
 * given spot waited a long time between lights. Several streaks share each
 * line instead, spaced evenly along its cycle, so the gap before the next
 * one at any spot is a fraction of the cycle.
 */

type BackgroundLinesProps = {
  /** How many vertical lines, spread evenly across the width. */
  lineCount?: number;
  /** Streaks travelling along each line at the same time. */
  pulsesPerLine?: number;
};

export function BackgroundLines({
  lineCount = 5,
  pulsesPerLine = 6,
}: BackgroundLinesProps) {
  return (
    <div className="new-ui-lines">
      {Array.from({ length: lineCount }).map((_, index) => {
        // 8–14s per pass: slow, drifting streaks rather than racing ones.
        const duration = 8 + (index % 5) * 1.5;
        return (
          <span
            className="new-ui-line"
            key={index}
            style={{ left: `${((index + 1) / (lineCount + 1)) * 100}%` }}
          >
            {Array.from({ length: pulsesPerLine }).map((__, pulse) => (
              <span
                className={`new-ui-line-pulse ${index % 2 === 0 ? "new-ui-line-pulse-down" : "new-ui-line-pulse-up"}`}
                key={pulse}
                style={{
                  animationDuration: `${duration}s`,
                  // Evenly spaced along the cycle, with each line offset so
                  // neighbouring lines don't fire in step.
                  animationDelay: `${-(index * 1.3 + (pulse * duration) / pulsesPerLine)}s`,
                }}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
