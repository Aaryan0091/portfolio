const USERNAME = "Aaryan91";
const API_BASE = "https://alfa-leetcode-api.onrender.com";

type CalendarResponse = {
  submissionCalendar?: Record<string, number> | string;
};

type SolvedResponse = {
  solvedProblem?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
};

async function fetchLeetCode<T>(path: string) {
  const response = await fetch(`${API_BASE}/${USERNAME}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`LeetCode API returned ${response.status}`);
  return response.json() as Promise<T>;
}

function parseCalendar(value: CalendarResponse["submissionCalendar"]) {
  if (!value) return undefined;

  try {
    const parsed = typeof value === "string"
      ? JSON.parse(value) as Record<string, unknown>
      : value;
    const calendar = Object.fromEntries(
      Object.entries(parsed).filter(
        ([timestamp, count]) => Number.isFinite(Number(timestamp)) && typeof count === "number",
      ),
    ) as Record<string, number>;

    return Object.keys(calendar).length > 0 ? calendar : undefined;
  } catch {
    return undefined;
  }
}

export async function GET() {
  const [calendarResult, solvedResult] = await Promise.allSettled([
    fetchLeetCode<CalendarResponse>("/calendar"),
    fetchLeetCode<SolvedResponse>("/solved"),
  ]);

  const calendar = calendarResult.status === "fulfilled"
    ? parseCalendar(calendarResult.value.submissionCalendar)
    : undefined;
  const solved = solvedResult.status === "fulfilled"
    ? solvedResult.value
    : undefined;

  if (!calendar && !solved?.solvedProblem) {
    return Response.json(
      { error: "LeetCode data is temporarily unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json({
    calendar,
    solved: solved?.solvedProblem,
    complete: Boolean(calendar && solved?.solvedProblem),
    difficulties: solved ? [
      { difficulty: "Easy", count: solved.easySolved ?? 0 },
      { difficulty: "Medium", count: solved.mediumSolved ?? 0 },
      { difficulty: "Hard", count: solved.hardSolved ?? 0 },
    ] : undefined,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
