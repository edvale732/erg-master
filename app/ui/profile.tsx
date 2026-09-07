import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { getRowingSessionsWithIntervals } from "@/app/lib/actions";

const formatDistance = (distance: number) => `${(distance / 1000).toFixed(1)} km`;

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

export default async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessions = await getRowingSessionsWithIntervals();
  const totalDistance = sessions.reduce((sum, rowingSession) => sum + rowingSession.intervals.reduce((intervalSum, interval) => intervalSum + interval.distance, 0), 0);
  const totalTime = sessions.reduce((sum, rowingSession) => sum + rowingSession.intervals.reduce((intervalSum, interval) => intervalSum + interval.timeSeconds, 0), 0);
  const averageDistance = sessions.length === 0 ? 0 : totalDistance / sessions.length;
  const memberSince = session?.user.createdAt
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(session.user.createdAt))
    : "Not available";

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl bg-[#f7fbff] p-7 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]" aria-labelledby="account-details-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6fd1]">Account</p>
          <h2 id="account-details-heading" className="mt-3 text-2xl font-semibold">Account details</h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-sm font-semibold text-[#55708f]">Name</dt>
              <dd className="mt-1 text-lg font-medium">{session?.user.name || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-[#55708f]">Email</dt>
              <dd className="mt-1 break-words text-lg font-medium">{session?.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-[#55708f]">Member since</dt>
              <dd className="mt-1 text-lg font-medium">{memberSince}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="account-stats-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Training record</p>
          <h2 id="account-stats-heading" className="mt-3 text-2xl font-semibold">Account stats</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b5d3ef]">Sessions</p>
              <p className="mt-8 text-4xl font-semibold">{sessions.length}</p>
              <p className="mt-2 text-sm text-[#dceeff]">completed rowing sessions</p>
            </div>
            <div className="rounded-2xl bg-[#2f80ed] p-6 text-[#f7fbff]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#dceeff]">Distance</p>
              <p className="mt-8 text-4xl font-semibold">{formatDistance(totalDistance)}</p>
              <p className="mt-2 text-sm text-[#e5f2ff]">total distance rowed</p>
            </div>
            <div className="rounded-2xl bg-[#f7fbff] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#55708f]">Time</p>
              <p className="mt-8 text-4xl font-semibold">{formatDuration(totalTime)}</p>
              <p className="mt-2 text-sm text-[#55708f]">total time on the erg</p>
            </div>
            <div className="rounded-2xl bg-[#dceeff] p-6 text-[#071a33]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#294a6d]">Average session</p>
              <p className="mt-8 text-4xl font-semibold">{formatDistance(averageDistance)}</p>
              <p className="mt-2 text-sm text-[#294a6d]">distance per session</p>
            </div>
          </div>
        </section>
    </div>
  );
}