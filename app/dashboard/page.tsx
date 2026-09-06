import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Dashboard</p>
        <h1 className="max-w-2xl text-6xl font-semibold leading-[0.92] tracking-tight sm:text-8xl">
          Welcome back, {session.user.name}.
        </h1>
        <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">
          Your training space is ready. This is where your rowing sessions and progress will live.
        </p>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]">
            <p className="text-sm text-[#b5d3ef]">Sessions logged</p>
            <p className="mt-8 text-5xl font-semibold">0</p>
          </div>
          <div className="rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
            <p className="text-sm text-[#55708f]">Current streak</p>
            <p className="mt-8 text-5xl font-semibold">0 days</p>
          </div>
          <div className="rounded-2xl bg-[#2f80ed] p-6 text-white">
            <p className="text-sm text-[#dceeff]">Next step</p>
            <p className="mt-8 text-2xl font-semibold">Log your first session</p>
          </div>
        </div>
      </section>
  );
}
