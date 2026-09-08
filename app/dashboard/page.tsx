import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRowingSessionsWithIntervals } from "@/app/lib/actions";
import { auth } from "@/app/lib/auth";
import { WeeklyActivity, WeeklyStreak } from "@/app/ui/dashboard-home";
import DashboardHomeSkeleton from "@/app/ui/dashboard-home-skeleton";


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "An overview of your ErgMaster dashboard"
};

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

async function DashboardWidgets() {
  const sessions = await getRowingSessionsWithIntervals();

  return (
    <div className="grid gap-5 text-left">
      <WeeklyStreak value={getWeeklyStreak(sessions)} />
      <WeeklyActivity activity={getWeeklyActivity(sessions)} />
    </div>
  );
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }


  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-16">
          <div className="flex flex-col">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Dashboard</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
              Welcome back, {session.user.name}.
            </h1>

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

          <Suspense fallback={<DashboardHomeSkeleton />}>
            <DashboardWidgets />
          </Suspense>
        </div>
      </section>
  );
}
