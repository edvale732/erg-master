import type { RowingSession } from "@/app/lib/actions";

const formatDuration = (totalTimeSeconds: number) => {
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatOptionalDuration = (totalTimeSeconds: number | null) =>
  totalTimeSeconds === null ? "-" : formatDuration(totalTimeSeconds);

const formatDistance = (totalDistance: number) => `${totalDistance.toLocaleString()} m`;

const formatCreatedAt = (createdAt: string) =>
  new Date(createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function SessionHistory({ sessions }: { sessions: RowingSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="mt-16 rounded-2xl bg-[#fffdf7] p-8 shadow-[0_16px_50px_rgba(23,59,53,0.08)]">
        <p className="text-lg font-semibold text-[#173b35]">No sessions logged yet.</p>
        <p className="mt-2 text-[#5b6d66]">Your completed rowing sessions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-3">
      {sessions.map((session) => (
        <article
          key={session.id}
          className="grid gap-4 rounded-2xl bg-[#fffdf7] p-6 shadow-[0_16px_50px_rgba(23,59,53,0.08)] sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#cf633f]">
              {new Date(`${session.sessionDate}T00:00:00`).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#173b35]">{session.workoutType}</h2>
          </div>
          <dl className="grid gap-x-5 gap-y-4 text-sm sm:grid-cols-3 sm:text-right">
            <div>
              <dt className="text-[#829189]">Distance</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{formatDistance(session.totalDistance)}</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Time</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{formatDuration(session.totalTimeSeconds)}</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Avg watts</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{session.avgWatts ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Target pace</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{formatOptionalDuration(session.targetPaceSeconds)}</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Avg stroke rate</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{session.avgStrokeRate ?? "-"} spm</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Target stroke rate</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{session.targetStrokeRate ?? "-"} spm</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Drag factor</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{session.dragFactor ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-[#829189]">Logged</dt>
              <dd className="mt-1 font-semibold text-[#36584f]">{formatCreatedAt(session.createdAt)}</dd>
            </div>
          </dl>
          {session.notes && (
            <p className="border-t border-[#dbe5dd] pt-4 text-sm leading-6 text-[#5b6d66] sm:col-span-2">
              <span className="font-semibold text-[#36584f]">Notes: </span>
              {session.notes}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
