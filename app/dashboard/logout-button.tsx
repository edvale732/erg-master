"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-busy={isLoggingOut}
      className="rounded-xl border border-[#9db8d3] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f7fbff] hover:text-[#071a33] disabled:cursor-wait disabled:opacity-70"
    >
      {isLoggingOut ? (
        <span className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" className="opacity-90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Logging out...
        </span>
      ) : (
        "Log out"
      )}
    </button>
  );
}
