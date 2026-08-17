type DifficultyStat = {
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
};

type Submission = {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  langName: string;
};

type LeetCodeProfileResponse = {
  profile?: { ranking?: number };
  submitStats?: {
    acSubmissionNum?: Array<{ difficulty: string; count: number }>;
  };
};

type LeetCodeCalendarResponse = {
  streak?: number;
  totalActiveDays?: number;
  submissionCalendar?: Record<string, number> | string;
};

const USERNAME = "Aaryan91";
const API_BASE = "https://alfa-leetcode-api.onrender.com";
const PROFILE_URL = `https://leetcode.com/u/${USERNAME}`;
const ONE_DAY = 86_400;

const fallbackCounts = [
  3, 2, 9, 6, 2, 4, 5, 5, 4, 5, 2, 6, 5, 4, 3, 2, 8, 4, 3, 5, 3, 6,
  4, 5, 7, 14, 4, 3, 3, 5, 2, 2, 2, 4, 1, 2, 4, 3, 2, 2, 3, 3, 2, 3,
  2, 6, 9, 4, 3, 2, 2, 6, 4, 10, 3, 1, 5, 5, 2, 2, 1, 1, 4, 3, 3, 1,
  3, 4, 1, 2, 1, 2, 2, 3, 5, 3, 1,
];

const fallbackCalendar = Object.fromEntries(
  fallbackCounts.map((count, index) => [String(1_780_272_000 + index * ONE_DAY), count]),
);

const fallbackSubmissions: Submission[] = [
  { id: "2109201580", title: "Same Tree", titleSlug: "same-tree", timestamp: "1786896954", statusDisplay: "Accepted", langName: "C++" },
  { id: "2107554981", title: "Balanced Binary Tree", titleSlug: "balanced-binary-tree", timestamp: "1786791678", statusDisplay: "Accepted", langName: "C++" },
  { id: "2107515933", title: "Diameter of Binary Tree", titleSlug: "diameter-of-binary-tree", timestamp: "1786789171", statusDisplay: "Accepted", langName: "C++" },
  { id: "2106577998", title: "Maximum Depth of Binary Tree", titleSlug: "maximum-depth-of-binary-tree", timestamp: "1786710264", statusDisplay: "Accepted", langName: "C++" },
  { id: "2106522390", title: "Invert Binary Tree", titleSlug: "invert-binary-tree", timestamp: "1786705965", statusDisplay: "Accepted", langName: "C++" },
];

const fallbackData = {
  solved: 165,
  ranking: 1_025_782,
  streak: 97,
  activeDays: 135,
  difficulties: [
    { difficulty: "Easy", count: 101 },
    { difficulty: "Medium", count: 58 },
    { difficulty: "Hard", count: 6 },
  ] satisfies DifficultyStat[],
  calendar: fallbackCalendar,
  submissions: fallbackSubmissions,
  isLive: false,
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${USERNAME}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function parseCalendar(calendar: LeetCodeCalendarResponse["submissionCalendar"]) {
  if (!calendar) return {};
  if (typeof calendar === "string") {
    return JSON.parse(calendar) as Record<string, number>;
  }
  return calendar;
}

async function getLeetCodeData() {
  try {
    const [profile, calendar, submissions] = await Promise.all([
      fetchJson<LeetCodeProfileResponse>(""),
      fetchJson<LeetCodeCalendarResponse>("/calendar"),
      fetchJson<Submission[]>("/submission?limit=12"),
    ]);

    const accepted = profile.submitStats?.acSubmissionNum ?? [];
    const solved = accepted.find((item) => item.difficulty === "All")?.count;
    const difficulties = (["Easy", "Medium", "Hard"] as const).map((difficulty) => ({
      difficulty,
      count: accepted.find((item) => item.difficulty === difficulty)?.count ?? 0,
    }));
    const uniqueAccepted = submissions
      .filter((submission) => submission.statusDisplay === "Accepted")
      .filter((submission, index, list) =>
        list.findIndex((item) => item.titleSlug === submission.titleSlug) === index,
      )
      .slice(0, 5);

    if (!solved || !calendar.streak || uniqueAccepted.length === 0) {
      throw new Error("LeetCode API returned incomplete data");
    }

    return {
      solved,
      ranking: profile.profile?.ranking ?? fallbackData.ranking,
      streak: calendar.streak,
      activeDays: calendar.totalActiveDays ?? fallbackData.activeDays,
      difficulties,
      calendar: parseCalendar(calendar.submissionCalendar),
      submissions: uniqueAccepted,
      isLive: true,
    };
  } catch {
    return fallbackData;
  }
}

function getActivityDays(calendar: Record<string, number>) {
  const timestamps = Object.keys(calendar).map(Number).filter(Number.isFinite);
  const lastDay = timestamps.length > 0
    ? Math.max(...timestamps)
    : Math.floor(Date.now() / 1000);
  const date = new Date(lastDay * 1000);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + (6 - date.getUTCDay()));
  const gridEnd = Math.floor(date.getTime() / 1000);
  const gridStart = gridEnd - 83 * ONE_DAY;

  return Array.from({ length: 84 }, (_, index) => {
    const timestamp = gridStart + index * ONE_DAY;
    return { timestamp, count: calendar[String(timestamp)] ?? 0 };
  });
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
    <div className="leetcode-panel leetcode-skeleton" aria-label="Loading live LeetCode activity">
      <div className="skeleton-block" />
      <div className="skeleton-block" />
    </div>
  );
}

export async function LeetCodeActivity() {
  const data = await getLeetCodeData();
  const activityDays = getActivityDays(data.calendar);
  const difficultyTotal = data.difficulties.reduce((total, item) => total + item.count, 0);
  const easyEnd = (data.difficulties[0].count / difficultyTotal) * 360;
  const mediumEnd = easyEnd + (data.difficulties[1].count / difficultyTotal) * 360;

  return (
    <div className="leetcode-panel">
      <div className="leetcode-panel-header">
        <div>
          <span className={`live-indicator${data.isLive ? " is-live" : ""}`}>
            <i /> {data.isLive ? "Live profile" : "Verified snapshot"}
          </span>
          <span className="leetcode-refresh-note">Refreshes hourly</span>
        </div>
        <a className="leetcode-profile-link" href={PROFILE_URL} target="_blank" rel="noreferrer">
          @{USERNAME}
          <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
            <path d="M7 4h9v9M16 4 7 13" />
          </svg>
        </a>
      </div>

      <div className="leetcode-overview">
        <div
          className="leetcode-solved-ring"
          aria-label={`${data.solved} problems solved: ${data.difficulties.map((item) => `${item.count} ${item.difficulty}`).join(", ")}`}
          style={{
            background: `conic-gradient(var(--leetcode-easy) 0deg ${easyEnd}deg, var(--leetcode-medium) ${easyEnd}deg ${mediumEnd}deg, var(--leetcode-hard) ${mediumEnd}deg 360deg)`,
          }}
        >
          <div>
            <strong>{data.solved}</strong>
            <span>Solved</span>
          </div>
        </div>

        <div className="difficulty-list" aria-label="Problems solved by difficulty">
          {data.difficulties.map((item) => (
            <div className={`difficulty-item difficulty-${item.difficulty.toLowerCase()}`} key={item.difficulty}>
              <span>{item.difficulty}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>

        <div className="leetcode-mini-stats">
          <div><span>Streak</span><strong>{data.streak}<small> days</small></strong></div>
          <div><span>Active</span><strong>{data.activeDays}<small> days</small></strong></div>
          <div><span>Rank</span><strong>#{data.ranking.toLocaleString("en-IN")}</strong></div>
        </div>
      </div>

      <div className="leetcode-detail">
        <div className="activity-heading">
          <div>
            <span>Submission activity</span>
            <strong>12-week activity</strong>
          </div>
          <div className="activity-legend" aria-label="Activity intensity from less to more">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => <i className={`level-${level}`} key={level} />)}
            <span>More</span>
          </div>
        </div>

        <div className="activity-grid" aria-label="LeetCode submissions over the last 12 weeks">
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

        <div className="recent-submissions">
          <span className="recent-label">Recent accepted</span>
          <div>
            {data.submissions.map((submission, index) => (
              <a
                href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                target="_blank"
                rel="noreferrer"
                key={submission.id}
              >
                <span>0{index + 1}</span>
                <strong>{submission.title}</strong>
                <small>{submission.langName} · {formatDate(Number(submission.timestamp))}</small>
                <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
                  <path d="M3.5 10h12M11 5.5l4.5 4.5-4.5 4.5" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
