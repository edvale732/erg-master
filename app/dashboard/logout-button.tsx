"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-[#173b35] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#173b35] hover:text-white"
    >
      Log out
    </button>
  );
}
