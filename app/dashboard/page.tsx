import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { LogoutButton } from "@/app/dashboard/logout-button";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#e8eee9] text-[#173b35]">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">
          Erg Master
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[#5b6d66] sm:inline">{session.user.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">Dashboard</p>
        <h1 className="max-w-2xl text-6xl font-semibold leading-[0.92] tracking-tight sm:text-8xl">
          Welcome back, {session.user.name}.
        </h1>
        <p className="mt-8 max-w-xl text-xl leading-8 text-[#5b6d66]">
          Your training space is ready. This is where your rowing sessions and progress will live.
        </p>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#173b35] p-6 text-[#fffdf7]">
            <p className="text-sm text-[#91b1a0]">Sessions logged</p>
            <p className="mt-8 text-5xl font-semibold">0</p>
          </div>
          <div className="rounded-2xl bg-[#fffdf7] p-6 shadow-[0_16px_50px_rgba(23,59,53,0.08)]">
            <p className="text-sm text-[#829189]">Current streak</p>
            <p className="mt-8 text-5xl font-semibold">0 days</p>
          </div>
          <div className="rounded-2xl bg-[#cf633f] p-6 text-white">
            <p className="text-sm text-[#ffe1d4]">Next step</p>
            <p className="mt-8 text-2xl font-semibold">Log your first session</p>
          </div>
        </div>
      </section>
    </main>
  );
}
