import type { SessionHistoryEntry } from "@/app/lib/actions/session-history";
import type { RowingSessionWithIntervals } from "@/app/lib/actions/rowing-sessions";
import type { StrengthSessionWithExercises } from "@/app/lib/actions/strength-sessions";
import { formatDurationClock } from "@/app/lib/format";
import Link from "next/link";

const formatPace = (totalTimeSeconds: number, totalDistance: number) => {
  if (totalDistance <= 0) return "-";

  return formatDurationClock(Math.round((totalTimeSeconds / totalDistance) * 500));
};

const formatSessionDate = (sessionDate: string) =>
  new Date(`${sessionDate}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function ChevronIcon() {
  return (
    <span className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1f6fd1]" aria-hidden="true">
      <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

function RowingHistoryRow({ session }: { session: RowingSessionWithIntervals }) {
  const totalDistance = session.intervals.reduce((sum, interval) => sum + (interval.distance ?? 0), 0);
  const totalTimeSeconds = session.intervals.reduce((sum, interval) => sum + (interval.timeSeconds ?? 0), 0);
  const title = session.intervals.length === 1
    ? `${totalDistance.toLocaleString()} m`
    : `${session.intervals.length} x ${(session.intervals[0]?.distance ?? 0).toLocaleString()} m`;

  return (
    <Link
      href={`/dashboard/edit-session/${session.id}`}
      className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[#f7fbff] p-4 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_18px_55px_rgba(0,0,0,0.26)] sm:flex-nowrap sm:p-5"
    >
      <div className="shrink-0 sm:w-[12.5rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1f6fd1]">Rowing &middot; {formatSessionDate(session.sessionDate)}</p>
        <h2 className="mt-1 text-xl font-semibold text-[#071a33]">{title}</h2>
      </div>
      <dl className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Distance</dt>
          <dd className="font-semibold text-[#36584f]">{totalDistance.toLocaleString()} m</dd>
        </div>
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Time</dt>
          <dd className="font-semibold text-[#36584f]">{formatDurationClock(totalTimeSeconds)}</dd>
        </div>
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Pace / 500 m</dt>
          <dd className="font-semibold text-[#36584f]">{formatPace(totalTimeSeconds, totalDistance)}</dd>
        </div>
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Intervals</dt>
          <dd className="font-semibold text-[#36584f]">{session.intervals.length}</dd>
        </div>
      </dl>
      <ChevronIcon />
    </Link>
  );
}

function StrengthHistoryRow({ session }: { session: StrengthSessionWithExercises }) {
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const totalVolumeKg = session.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.reduce((setsSum, set) => setsSum + set.reps * set.weightKg, 0),
    0,
  );
  const title = session.exercises.length === 1
    ? session.exercises[0].exerciseName
    : `${session.exercises.length} exercises`;

  return (
    <Link
      href={`/dashboard/edit-session/strength/${session.id}`}
      className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[#f7fbff] p-4 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_18px_55px_rgba(0,0,0,0.26)] sm:flex-nowrap sm:p-5"
    >
      <div className="shrink-0 sm:w-[12.5rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1f6fd1]">Strength &middot; {formatSessionDate(session.sessionDate)}</p>
        <h2 className="mt-1 text-xl font-semibold text-[#071a33]">{title}</h2>
      </div>
      <dl className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Exercises</dt>
          <dd className="font-semibold text-[#36584f]">{session.exercises.length}</dd>
        </div>
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Sets</dt>
          <dd className="font-semibold text-[#36584f]">{totalSets}</dd>
        </div>
        <div className="flex-1">
          <dt className="text-xs text-[#55708f]">Volume</dt>
          <dd className="font-semibold text-[#36584f]">{Math.round(totalVolumeKg).toLocaleString()} kg</dd>
        </div>
      </dl>
      <ChevronIcon />
    </Link>
  );
}

export default function SessionHistory({ entries }: { entries: SessionHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="mt-16 rounded-2xl bg-[#f7fbff] p-8 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
        <p className="text-lg font-semibold text-[#071a33]">No sessions logged yet.</p>
        <p className="mt-2 text-[#55708f]">Your completed rowing and strength sessions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        entry.kind === "rowing"
          ? <RowingHistoryRow key={entry.session.id} session={entry.session} />
          : <StrengthHistoryRow key={entry.session.id} session={entry.session} />
      ))}
    </div>
  );
}
