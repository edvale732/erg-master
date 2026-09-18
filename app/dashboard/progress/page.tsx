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
      
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Progress</h1>
      
      <Suspense fallback={<ProgressSkeleton />}>
        <ProgressWidgets />
      </Suspense>
    </section>
  );
}
