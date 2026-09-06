import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { getRowingSessions } from "@/app/lib/actions";
import { LogoutButton } from "@/app/dashboard/logout-button";

const formatDistance = (distance: number) => `${(distance / 1000).toFixed(1)} km`;

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessions = await getRowingSessions();
  const totalDistance = sessions.reduce((sum, rowingSession) => sum + rowingSession.totalDistance, 0);
  const totalTime = sessions.reduce((sum, rowingSession) => sum + rowingSession.totalTimeSeconds, 0);
  const averageDistance = sessions.length === 0 ? 0 : totalDistance / sessions.length;
  const memberSince = session?.user.createdAt
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(session.user.createdAt))
    : "Not available";

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="flex flex-col gap-8 border-b border-[#c3d2c8] pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">Profile</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Your training, in one place.</h1>
          <p className="mt-8 max-w-xl text-xl leading-8 text-[#5b6d66]">Keep an eye on your account and the work you have put in.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl bg-[#fffdf7] p-7 shadow-[0_16px_50px_rgba(23,59,53,0.08)]" aria-labelledby="account-details-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">Account</p>
          <h2 id="account-details-heading" className="mt-3 text-2xl font-semibold">Account details</h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-sm font-semibold text-[#5b6d66]">Name</dt>
              <dd className="mt-1 text-lg font-medium">{session?.user.name || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-[#5b6d66]">Email</dt>
              <dd className="mt-1 break-words text-lg font-medium">{session?.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-[#5b6d66]">Member since</dt>
              <dd className="mt-1 text-lg font-medium">{memberSince}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="account-stats-heading">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">Training record</p>
          <h2 id="account-stats-heading" className="mt-3 text-2xl font-semibold">Account stats</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#173b35] p-6 text-[#fffdf7]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b9d0c0]">Sessions</p>
              <p className="mt-8 text-4xl font-semibold">{sessions.length}</p>
              <p className="mt-2 text-sm text-[#d7e5da]">completed rowing sessions</p>
            </div>
            <div className="rounded-2xl bg-[#cf633f] p-6 text-[#fffdf7]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ffe2d7]">Distance</p>
              <p className="mt-8 text-4xl font-semibold">{formatDistance(totalDistance)}</p>
              <p className="mt-2 text-sm text-[#fff0e9]">total distance rowed</p>
            </div>
            <div className="rounded-2xl bg-[#fffdf7] p-6 shadow-[0_16px_50px_rgba(23,59,53,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5b6d66]">Time</p>
              <p className="mt-8 text-4xl font-semibold">{formatDuration(totalTime)}</p>
              <p className="mt-2 text-sm text-[#5b6d66]">total time on the erg</p>
            </div>
            <div className="rounded-2xl bg-[#e1eadf] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#36584f]">Average session</p>
              <p className="mt-8 text-4xl font-semibold">{formatDistance(averageDistance)}</p>
              <p className="mt-2 text-sm text-[#36584f]">distance per session</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
