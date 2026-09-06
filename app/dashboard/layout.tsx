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
    <main className="min-h-screen bg-[#071a33] text-[#f7fbff]">
      <nav className="border-b border-[#2d4e73] bg-[#0d2b50] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:px-10">
          <Link
            href="/"
            aria-label="ErgMaster"
            title="ErgMaster"
            className="text-base font-semibold text-[#f7fbff] transition-colors hover:text-[#69b3ff]"
          >
            ErgMaster
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base font-semibold text-[#c4d8ed] sm:justify-self-center">
            <Link href="/dashboard" className="transition-colors hover:text-[#69b3ff]">
              Home
            </Link>
            <Link href="/dashboard/progress" className="transition-colors hover:text-[#69b3ff]">
              Progress
            </Link>
            <Link
              href="/dashboard/log"
              aria-label="Log session"
              title="Log session"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#69b3ff] text-2xl leading-none transition-colors hover:bg-[#69b3ff] hover:text-[#071a33]"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
            <Link href="/dashboard/workouts" className="transition-colors hover:text-[#69b3ff]">
              Workouts
            </Link>
            <Link href="/dashboard/history" className="transition-colors hover:text-[#69b3ff]">
              History
            </Link>
  
          </div>
          
          <Link
            href="/dashboard/profile"
            aria-label="Profile"
            className="flex items-center gap-2 text-base font-semibold text-[#f7fbff] transition-colors hover:text-[#69b3ff] sm:justify-self-end"
          >
            <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
            <span>Profile</span>
          </Link>
          
        </div>
      </nav>

      {children}
    </main>
  );
}
