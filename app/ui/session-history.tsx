import type { RowingSessionWithIntervals } from "@/app/lib/actions";
import Link from "next/link";

const formatDuration = (totalTimeSeconds: number) => {
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatCreatedAt = (createdAt: string) =>
  new Date(createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

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
    <div className="mt-16 space-y-3">
      {sessions.map((session) => (
        (() => {
          const totalDistance = session.intervals.reduce((sum, interval) => sum + interval.distance, 0);
          const totalTimeSeconds = session.intervals.reduce((sum, interval) => sum + interval.timeSeconds, 0);
          return (
        <article
          key={session.id}
          className="grid gap-4 rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#1f6fd1]">
              {new Date(`${session.sessionDate}T00:00:00`).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#071a33]">
              {session.intervals.length} {session.intervals.length === 1 ? "interval" : "intervals"}
            </h2>
          </div>
          <dl className="grid gap-x-5 gap-y-4 text-sm sm:grid-cols-3 sm:text-right">
            <div>
              <dt className="text-[#55708f]">Distance</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{totalDistance.toLocaleString()} m</dd>
            </div>
            <div>
              <dt className="text-[#55708f]">Time</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{formatDuration(totalTimeSeconds)}</dd>
            </div>
            <div>
              <dt className="text-[#55708f]">Avg watts</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">
                {session.intervals.length === 0 ? "-" : Math.round(session.intervals.reduce((sum, interval) => sum + (interval.avgWatts ?? 0), 0) / session.intervals.filter((interval) => interval.avgWatts !== null).length) || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[#55708f]">Logged</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{formatCreatedAt(session.createdAt)}</dd>
            </div>
          </dl>
          {session.notes && (
            <p className="border-t border-[#c8dced] pt-4 text-sm leading-6 text-[#55708f] sm:col-span-2">
              <span className="font-semibold text-[#36584f]">Notes: </span>
              {session.notes}
            </p>
          )}
          <Link
            href={`/dashboard/edit-session/${session.id}`}
            className="border-t border-[#c8dced] pt-4 text-sm font-semibold text-[#1f6fd1] transition-colors hover:text-[#1255a0] sm:col-span-2"
          >
            Edit session
          </Link>
        </article>
          );
        })()
      ))}
    </div>
  );
}
