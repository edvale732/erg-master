import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRowingSessionsWithIntervals } from "@/app/lib/actions";
import { auth } from "@/app/lib/auth";

const WEEKS_TO_DISPLAY = 8;

const startOfWeek = (date: Date) => {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getWeeklyStreak = (sessions: Awaited<ReturnType<typeof getRowingSessionsWithIntervals>>) => {
  const activeWeeks = new Set(
    sessions.map((session) => dateKey(startOfWeek(new Date(`${session.sessionDate.slice(0, 10)}T00:00:00`)))),
  );
  const week = startOfWeek(new Date());
  const currentWeekIsActive = activeWeeks.has(dateKey(week));

  if (!currentWeekIsActive) week.setDate(week.getDate() - 7);

  let streak = 0;
  while (activeWeeks.has(dateKey(week))) {
    streak += 1;
    week.setDate(week.getDate() - 7);
  }

  return streak;
};

const getWeeklyActivity = (sessions: Awaited<ReturnType<typeof getRowingSessionsWithIntervals>>) => {
  const currentWeek = startOfWeek(new Date());
  const activity = Array.from({ length: WEEKS_TO_DISPLAY }, (_, index) => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() - (WEEKS_TO_DISPLAY - index - 1) * 7);
    return { label: date.toLocaleDateString("en", { month: "short", day: "numeric" }), date: dateKey(date), minutes: 0 };
  });
  const activityByDate = new Map(activity.map((week) => [week.date, week]));

  for (const session of sessions) {
    const sessionWeek = startOfWeek(new Date(`${session.sessionDate.slice(0, 10)}T00:00:00`));
    const week = activityByDate.get(dateKey(sessionWeek));
    if (week) week.minutes += Math.round(session.intervals.reduce((sum, interval) => sum + interval.timeSeconds, 0) / 60);
  }

  return activity;
};

const formatMinutes = (minutes: number) => `${minutes} min`;

export default async function DashboardHome() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const sessions = await getRowingSessionsWithIntervals();
  const weeklyStreak = getWeeklyStreak(sessions);
  const weeklyActivity = getWeeklyActivity(sessions);
  const maxActivity = Math.max(...weeklyActivity.map((week) => week.minutes), 1);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-16">
        <div className="flex flex-col">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Dashboard</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            Welcome back, {session.user.name}.
          </h1>
          <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">
            Your training space is ready. Keep building your rowing routine one session at a time.
          </p>

          <div className="mt-12 flex flex-wrap gap-4 lg:mt-auto lg:pt-12">
            <Link
              href="/dashboard/log"
              className="rounded-xl bg-[#2f80ed] px-6 py-3.5 font-semibold text-white transition hover:bg-[#1f6fd1]"
            >
              Log session
            </Link>
            <Link
              href="/dashboard/progress"
              className="rounded-xl border border-[#69b3ff] px-6 py-3.5 font-semibold text-[#f7fbff] transition hover:bg-[#69b3ff] hover:text-[#071a33]"
            >
              View progress
            </Link>
          </div>
        </div>

        <div className="grid gap-5 text-left">
          <div className="rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]">
            <p className="text-sm text-[#b5d3ef]">Weekly streak</p>
            <p className="mt-5 text-5xl font-semibold">{weeklyStreak}</p>
            <p className="mt-2 text-sm text-[#dceeff]">{weeklyStreak === 1 ? "week in a row" : "weeks in a row"}</p>
          </div>

          <figure className="rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]" aria-labelledby="weekly-activity-heading">
            <figcaption className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-lg font-semibold" id="weekly-activity-heading">Weekly activity</p>
                <p className="mt-1 text-sm text-[#55708f]">Time rowed over the last eight weeks</p>
              </div>
              <p className="text-sm font-semibold text-[#1f6fd1]">{formatMinutes(weeklyActivity.reduce((sum, week) => sum + week.minutes, 0))}</p>
            </figcaption>
            <div className="mt-8" role="img" aria-label="Line chart showing rowing time for each of the last eight weeks">
              <svg className="h-36 w-full" viewBox="0 0 700 150" preserveAspectRatio="none" aria-hidden="true">
                {[20, 70, 120].map((y) => <line key={y} x1="18" x2="690" y1={y} y2={y} stroke="#c8dced" strokeWidth="1" />)}
                <polyline
                  points={weeklyActivity.map((week, index) => `${18 + index * 96},${120 - (week.minutes / maxActivity) * 100}`).join(" ")}
                  fill="none"
                  stroke="#2f80ed"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {weeklyActivity.map((week, index) => {
                  const x = 18 + index * 96;
                  const y = 120 - (week.minutes / maxActivity) * 100;
                  return (
                    <g key={week.date}>
                      <circle cx={x} cy={y} r="5" fill="#f7fbff" stroke="#2f80ed" strokeWidth="3">
                        <title>{`${week.label}: ${formatMinutes(week.minutes)}`}</title>
                      </circle>
                      <text x={x} y="143" textAnchor="middle" fill="#55708f" fontSize="12">{week.label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}