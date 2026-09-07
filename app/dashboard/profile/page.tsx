import { Suspense } from "react";
import Profile from "@/app/ui/profile";
import ProfileSkeleton from "@/app/ui/profile-skeleton";
import { LogoutButton } from "@/app/dashboard/logout-button";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your profile information"
};

export default async function Page() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="flex flex-col gap-8 border-b border-[#2d4e73] pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Profile</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Your training, in one place.</h1>
          <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">Keep an eye on your account and the work you have put in.</p>
        </div>
        <LogoutButton />
      </div>

      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
    </section>
  );
}
