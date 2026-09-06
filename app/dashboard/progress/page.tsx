import { Suspense } from "react";
import Progress from "@/app/ui/progress";
import { ProgressSkeleton } from "@/app/ui/progress-skeleton";


export default function Page() {
  return (
    <Suspense fallback={<ProgressSkeleton />}>
      <Progress />
    </Suspense>
  );
}
