import { Suspense } from "react";
import Progress from "@/app/ui/progress";
import { ProgressSkeleton } from "@/app/ui/progress-skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress",
  description: "View your progress in ErgMaster"
};

export default function Page() {
  return (
    <Suspense fallback={<ProgressSkeleton />}>
      <Progress />
    </Suspense>
  );
}
