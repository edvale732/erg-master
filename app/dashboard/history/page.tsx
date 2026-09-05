import { getRowingSessions } from "@/app/lib/actions";

const formatDuration = (totalTimeSeconds: number) => {
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatDistance = (totalDistance: number) => `${totalDistance.toLocaleString()} m`;

export default async function Page() {
  const sessions = await getRowingSessions();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">History</p>
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Review the work you have done.</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#5b6d66]">Your completed rowing sessions will be listed here.</p>
      {sessions.length === 0 ? (
        <div className="mt-16 rounded-2xl bg-[#fffdf7] p-8 shadow-[0_16px_50px_rgba(23,59,53,0.08)]">
          <p className="text-lg font-semibold text-[#173b35]">No sessions logged yet.</p>
          <p className="mt-2 text-[#5b6d66]">Your completed rowing sessions will appear here.</p>
        </div>
      ) : (
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
              <dl className="grid grid-cols-3 gap-5 text-sm sm:text-right">
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
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
