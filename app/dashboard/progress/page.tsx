import { Suspense } from "react";
import ProgressWidgets from "@/app/ui/progress";
import { ProgressSkeleton } from "@/app/ui/progress-skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress",
  description: "View your progress in ErgMaster"
};

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Progress</p>
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">See how your training is moving.</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">A clear view of the distance you have rowed each week.</p>

      <Suspense fallback={<ProgressSkeleton />}>
        <ProgressWidgets />
      </Suspense>
    </section>
  );
}
