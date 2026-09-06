"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/workouts", label: "Workouts" },
  { href: "/dashboard/history", label: "History" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

function DashboardLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const isActive = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`transition-colors hover:text-[#69b3ff] ${isActive ? "text-[#69b3ff]" : ""}`}
    >
      {label}
    </Link>
  );
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base font-semibold text-[#c4d8ed] sm:justify-self-center">
      {navLinks.slice(0, 2).map((link) => (
        <DashboardLink key={link.href} {...link} pathname={pathname} />
      ))}
      <Link
        href="/dashboard/log"
        aria-label="Log session"
        title="Log session"
        aria-current={pathname === "/dashboard/log" ? "page" : undefined}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#69b3ff] text-2xl leading-none transition-colors hover:bg-[#69b3ff] hover:text-[#071a33] ${pathname === "/dashboard/log" ? "bg-[#69b3ff] text-[#071a33]" : ""}`}
      >
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
      {navLinks.slice(2).map((link) => (
        <DashboardLink key={link.href} {...link} pathname={pathname} />
      ))}
    </div>
  );
}

export function ProfileNavLink() {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, "/dashboard/profile");

  return (
    <Link
      href="/dashboard/profile"
      aria-label="Profile"
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2 text-base font-semibold transition-colors hover:text-[#69b3ff] sm:justify-self-end ${isActive ? "text-[#69b3ff]" : "text-[#f7fbff]"}`}
    >
      <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
      </svg>
      <span>Profile</span>
    </Link>
  );
}