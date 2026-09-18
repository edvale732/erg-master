import type { getRowingSessionsWithIntervals } from "@/app/lib/actions/rowing-sessions";
import type { WeightUnit } from "@/app/lib/actions/weight";
import { dateKey, startOfWeek } from "@/app/lib/weeks";

export { formatDistance, formatDurationDecimal as formatTimeSeconds } from "@/app/lib/format";

export const WEEK_COUNT = 8;
const KG_TO_LB = 2.20462;

export type Week = { label: string; start: Date; distance: number };
export type StreakStats = { current: number; longest: number; activeDays: number };

export const toDisplayWeight = (weightKg: number, unit: WeightUnit) =>
  unit === "lb" ? weightKg * KG_TO_LB : weightKg;

export const formatWeight = (weightKg: number, unit: WeightUnit) =>
  `${toDisplayWeight(weightKg, unit).toFixed(1)} ${unit}`;

export const formatShortDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en", { month: "short", day: "numeric" });

export const getStreakStats = (sessions: Awaited<ReturnType<typeof getRowingSessionsWithIntervals>>): StreakStats => {
  const sessionDays = new Set(sessions.map((session) => session.sessionDate.slice(0, 10)));
  const dates = [...sessionDays].sort();
  let longest = 0;
  let run = 0;
  let previousDate: Date | null = null;

  for (const dateString of dates) {
    const date = new Date(`${dateString}T00:00:00`);
    const isConsecutive = previousDate !== null &&
      (date.getTime() - previousDate.getTime()) === 24 * 60 * 60 * 1000;
    run = isConsecutive ? run + 1 : 1;
    longest = Math.max(longest, run);
    previousDate = date;
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const latestSessionDate = dates.at(-1);
  const streakEndsRecently = latestSessionDate === dateKey(currentDate) || latestSessionDate === dateKey(yesterday);

  if (!streakEndsRecently) return { current: 0, longest, activeDays: sessionDays.size };

  let current = 0;
  const streakDate = new Date(`${latestSessionDate}T00:00:00`);
  while (sessionDays.has(dateKey(streakDate))) {
    current += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  return { current, longest, activeDays: sessionDays.size };
};

export const getWeeks = (sessions: Awaited<ReturnType<typeof getRowingSessionsWithIntervals>>): Week[] => {
  const currentWeek = startOfWeek(new Date());
  const weeks = Array.from({ length: WEEK_COUNT }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (WEEK_COUNT - index - 1) * 7);
    return { label: start.toLocaleDateString("en", { month: "short", day: "numeric" }), start, distance: 0 };
  });
  const weeksByStart = new Map(weeks.map((week) => [dateKey(week.start), week]));

  for (const session of sessions) {
    const sessionWeek = startOfWeek(new Date(`${session.sessionDate.slice(0, 10)}T00:00:00`));
    const week = weeksByStart.get(dateKey(sessionWeek));
    if (week) week.distance += session.intervals.reduce((sum, interval) => sum + interval.distance, 0);
  }

  return weeks;
};
