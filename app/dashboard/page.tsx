import { Suspense } from "react";
import DashboardHome from "@/app/ui/dashboard-home";
import DashboardHomeSkeleton from "@/app/ui/dashboard-home-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<DashboardHomeSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
}
