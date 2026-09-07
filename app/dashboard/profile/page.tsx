import { Suspense } from "react";
import Profile from "@/app/ui/profile";
import ProfileSkeleton from "@/app/ui/profile-skeleton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your profile information"
};

export default async function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
}
