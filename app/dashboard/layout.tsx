import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/app/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#e8eee9] text-[#173b35]">
      <nav className="border-b border-[#c3d2c8] bg-[#fffdf7] shadow-[0_4px_20px_rgba(23,59,53,0.08)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <Link href="/" className="text-base font-semibold uppercase tracking-[0.2em] text-[#cf633f]">
            Erg Master
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base font-semibold text-[#36584f]">
            <Link href="/dashboard/progress" className="transition-colors hover:text-[#cf633f]">
              Progress
            </Link>
            <Link href="/dashboard/log" className="transition-colors hover:text-[#cf633f]">
              Log
            </Link>
            <Link href="/dashboard/workouts" className="transition-colors hover:text-[#cf633f]">
              Workouts
            </Link>
            <Link href="/dashboard/history" className="transition-colors hover:text-[#cf633f]">
              History
            </Link>
          <Link
            href="/dashboard/profile"
            aria-label="Profile"
            className="flex items-center gap-2 text-base font-semibold text-[#173b35] transition-colors hover:text-[#cf633f]"
          >
            <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
            <span>Profile</span>
          </Link>
          </div>
        </div>
      </nav>

      {children}
    </main>
  );
}
