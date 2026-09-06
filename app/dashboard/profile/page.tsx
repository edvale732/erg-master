import { Suspense } from "react";
import Profile from "@/app/ui/profile";
import ProfileSkeleton from "@/app/ui/profile-skeleton";

export default async function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
}
