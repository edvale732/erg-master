import type { RowingSessionWithIntervals } from "@/app/lib/actions";
import Link from "next/link";

const formatDuration = (totalTimeSeconds: number) => {
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatPace = (totalTimeSeconds: number, totalDistance: number) => {
  if (totalDistance <= 0) return "-";

  return formatDuration(Math.round((totalTimeSeconds / totalDistance) * 500));
};

export default function SessionHistory({ sessions }: { sessions: RowingSessionWithIntervals[] }) {
  if (sessions.length === 0) {
    return (
      <div className="mt-16 rounded-2xl bg-[#f7fbff] p-8 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
        <p className="text-lg font-semibold text-[#071a33]">No sessions logged yet.</p>
        <p className="mt-2 text-[#55708f]">Your completed rowing sessions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <div className="hidden items-center gap-x-8 px-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#a9bfd7] sm:flex">
        <div className="shrink-0 sm:w-[12.5rem]">Workout</div>
        <div className="flex min-w-0 flex-1 gap-x-6">
          <span className="flex-1">Distance</span>
          <span className="flex-1">Time</span>
          <span className="flex-1">Pace / 500 m</span>
          <span className="flex-1">Intervals</span>
        </div>
        <div className="h-10 w-10 shrink-0" />
      </div>
      {sessions.map((session) => (
        (() => {
          const totalDistance = session.intervals.reduce((sum, interval) => sum + interval.distance, 0);
          const totalTimeSeconds = session.intervals.reduce((sum, interval) => sum + interval.timeSeconds, 0);
          const title = session.intervals.length === 1
            ? `${totalDistance.toLocaleString()} m`
            : `${session.intervals.length} x ${session.intervals[0]?.distance.toLocaleString() ?? 0} m`;
          return (
        <Link
          href={`/dashboard/edit-session/${session.id}`}
          key={session.id}
          className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[#f7fbff] p-4 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_18px_55px_rgba(0,0,0,0.26)] sm:flex-nowrap sm:p-5"
        >
          <div className="shrink-0 sm:w-[12.5rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1f6fd1]">
              {new Date(`${session.sessionDate}T00:00:00`).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#071a33]">{title}</h2>
          </div>
          <dl className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex-1">
              <dd className="font-semibold text-[#36584f]">{totalDistance.toLocaleString()} m</dd>
            </div>
            <div className="flex-1">
              <dd className="font-semibold text-[#36584f]">{formatDuration(totalTimeSeconds)}</dd>
            </div>
            <div className="flex-1">
              <dd className="font-semibold text-[#36584f]">{formatPace(totalTimeSeconds, totalDistance)}</dd>
            </div>
            <div className="flex-1">
              <dd className="font-semibold text-[#36584f]">{session.intervals.length}</dd>
            </div>
          </dl>
          <span className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1f6fd1]" aria-hidden="true">
            <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </Link>
          );
        })()
      ))}
    </div>
  );
}
