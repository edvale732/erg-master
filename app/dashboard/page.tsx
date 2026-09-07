import { Suspense } from "react";
import DashboardHome from "@/app/ui/dashboard-home";
import DashboardHomeSkeleton from "@/app/ui/dashboard-home-skeleton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "An overview of your ErgMaster dashboard"
};

export default function Page() {
  return (
    <Suspense fallback={<DashboardHomeSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
}
