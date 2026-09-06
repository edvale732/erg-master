import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/app/lib/auth";
import { DashboardNav, ProfileNavLink } from "./dashboard-nav";

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
          <DashboardNav />
          <ProfileNavLink />
        </div>
      </nav>

      {children}
    </main>
  );
}
