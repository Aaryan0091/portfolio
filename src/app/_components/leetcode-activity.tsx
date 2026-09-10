'use client';

import { useCallback, useEffect, useState } from "react";

type LeetCodeCalendarResponse = {
  calendar?: Record<string, number>;
  solved?: number;
  difficulties?: DifficultyStat[];
  complete?: boolean;
};

type DifficultyStat = {
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
};

const USERNAME = "Aaryan91";
const PROFILE_URL = `https://leetcode.com/u/${USERNAME}`;
const ONE_DAY = 86_400;
const REFRESH_INTERVAL = 5 * 60 * 1_000;

const fallbackCounts = [
  3, 2, 9, 6, 2, 4, 5, 5, 4, 5, 2, 6, 5, 4, 3, 2, 8, 4, 3, 5, 3, 6,
  4, 5, 7, 14, 4, 3, 3, 5, 2, 2, 2, 4, 1, 2, 4, 3, 2, 2, 3, 3, 2, 3,
  2, 6, 9, 4, 3, 2, 2, 6, 4, 10, 3, 1, 5, 5, 2, 2, 1, 1, 4, 3, 3, 1,
  3, 4, 1, 2, 1, 2, 2, 3, 5, 3, 1,
];

const fallbackCalendar = Object.fromEntries(
  fallbackCounts.map((count, index) => [String(1_780_272_000 + index * ONE_DAY), count]),
);

const fallbackStats = {
  solved: 165,
  difficulties: [
    { difficulty: "Easy", count: 101 },
    { difficulty: "Medium", count: 58 },
    { difficulty: "Hard", count: 6 },
  ] satisfies DifficultyStat[],
};

function getActivityDays(calendar: Record<string, number>) {
  const timestamps = Object.keys(calendar).map(Number).filter(Number.isFinite);
  const lastDay = timestamps.length > 0 ? Math.max(...timestamps) : Math.floor(Date.now() / 1000);
  const date = new Date(lastDay * 1000);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + (6 - date.getUTCDay()));
  const gridEnd = Math.floor(date.getTime() / 1000);
  const gridStart = gridEnd - 370 * ONE_DAY;

  return Array.from({ length: 371 }, (_, index) => {
    const timestamp = gridStart + index * ONE_DAY;
    return { timestamp, count: calendar[String(timestamp)] ?? 0 };
  });
}

function getMonthLabels(days: Array<{ timestamp: number; count: number }>) {
  const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });

  return Array.from({ length: 53 }, (_, weekIndex) => {
    const representativeDay = days[Math.min(weekIndex * 7 + 3, days.length - 1)];
    const date = new Date(representativeDay.timestamp * 1000);
    return { column: weekIndex + 1, label: monthFormatter.format(date), month: date.getUTCMonth() };
  }).filter((item, index, list) => index === 0 || item.month !== list[index - 1].month);
}

function getActivityLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp * 1000));
}

export function LeetCodeActivitySkeleton() {
  return (
    <div className="leetcode-panel leetcode-skeleton" aria-label="Loading LeetCode activity graph">
      <div className="skeleton-block" />
      <div className="skeleton-block" />
    </div>
  );
}

export function LeetCodeActivity() {
  const [data, setData] = useState({
    calendar: fallbackCalendar,
    solved: fallbackStats.solved,
    difficulties: fallbackStats.difficulties,
  });
  const [syncState, setSyncState] = useState<"loading" | "live" | "partial" | "retrying">("loading");

  const refreshActivity = useCallback(async () => {
    try {
      const response = await fetch("/api/leetcode", { cache: "no-store" });
      if (!response.ok) throw new Error(`LeetCode proxy returned ${response.status}`);

      const fresh = await response.json() as LeetCodeCalendarResponse;
      setData((current) => ({
        calendar: fresh.calendar && Object.keys(fresh.calendar).length > 0
          ? fresh.calendar
          : current.calendar,
        solved: fresh.solved && fresh.solved > 0 ? fresh.solved : current.solved,
        difficulties: fresh.difficulties?.length === 3
          ? fresh.difficulties
          : current.difficulties,
      }));
      setSyncState(fresh.complete ? "live" : "partial");
    } catch {
      setSyncState("retrying");
    }
  }, []);

  useEffect(() => {
    void refreshActivity();
    const interval = window.setInterval(() => void refreshActivity(), REFRESH_INTERVAL);
    const refreshOnFocus = () => void refreshActivity();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [refreshActivity]);

  const activityDays = getActivityDays(data.calendar);
  const monthLabels = getMonthLabels(activityDays);
  const yearlySubmissions = activityDays.reduce((total, day) => total + day.count, 0);
  const easyCount = data.difficulties.find((item) => item.difficulty === "Easy")?.count ?? 0;
  const mediumCount = data.difficulties.find((item) => item.difficulty === "Medium")?.count ?? 0;
  const easyStop = data.solved > 0 ? (easyCount / data.solved) * 100 : 0;
  const mediumStop = data.solved > 0 ? ((easyCount + mediumCount) / data.solved) * 100 : 0;

  return (
    <div className="leetcode-panel">
      <div className="leetcode-solved-card">
        <div className="solved-card-copy">
          <span>Problems solved</span>
          <h3>Practice across every difficulty.</h3>
          <p>Accepted LeetCode problems, refreshed automatically with the profile.</p>
        </div>

        <div className="solved-card-data">
          <div
            className="solved-progress-ring"
            role="img"
            aria-label={`${data.solved} LeetCode problems solved: ${data.difficulties.map((item) => `${item.count} ${item.difficulty}`).join(", ")}`}
            style={{
              "--easy-stop": `${easyStop}%`,
              "--medium-stop": `${mediumStop}%`,
            } as React.CSSProperties}
          >
            <div>
              <strong>{data.solved}</strong>
              <span>Solved</span>
            </div>
          </div>

          <div className="difficulty-summary" aria-label="Problems solved by difficulty">
            {data.difficulties.map((item) => (
              <div className={`difficulty-summary-item difficulty-${item.difficulty.toLowerCase()}`} key={item.difficulty}>
                <span><i />{item.difficulty}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="leetcode-calendar-card">
        <div className="leetcode-graph-brand">
          <a className="leetcode-brand-link" href={PROFILE_URL} target="_blank" rel="noreferrer">
            <span className="leetcode-brand-mark" aria-hidden="true">LC</span>
            <span className="leetcode-brand-copy">
              <strong>LeetCode Activity</strong>
              <small>@{USERNAME}</small>
            </span>
            <svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17">
              <path d="M7 4h9v9M16 4 7 13" />
            </svg>
          </a>
        </div>

        <div
          className="leetcode-calendar-scroll"
          aria-label={`LeetCode submission calendar with ${yearlySubmissions} submissions in the last year`}
          tabIndex={0}
        >
          <div className="leetcode-calendar-canvas">
            <div className="calendar-months" aria-hidden="true">
              {monthLabels.map((month) => (
                <span style={{ gridColumnStart: month.column }} key={`${month.label}-${month.column}`}>
                  {month.label}
                </span>
              ))}
            </div>

            <div className="calendar-body">
              <div className="calendar-weekdays" aria-hidden="true">
                <span style={{ gridRow: 2 }}>Mon</span>
                <span style={{ gridRow: 4 }}>Wed</span>
                <span style={{ gridRow: 6 }}>Fri</span>
              </div>
              <div className="activity-grid">
                {activityDays.map((day) => {
                  const label = `${formatDate(day.timestamp)}: ${day.count} ${day.count === 1 ? "submission" : "submissions"}`;
                  return (
                    <span
                      className={`activity-cell level-${getActivityLevel(day.count)}`}
                      key={day.timestamp}
                      aria-label={day.count > 0 ? label : undefined}
                      aria-hidden={day.count === 0}
                      role={day.count > 0 ? "img" : undefined}
                      title={label}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="calendar-footer">
          <span>
            {syncState === "live"
              ? "Live LeetCode data · refreshes every 5 min"
              : syncState === "loading"
                ? "Updating LeetCode activity…"
                : syncState === "partial"
                  ? "Live activity · solved totals retrying"
                : "Cached snapshot · retrying automatically"}
          </span>
          <div className="activity-legend" aria-label="Activity intensity from less to more">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => <i className={`level-${level}`} key={level} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
