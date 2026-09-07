import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workouts",
  description: "View your saved workouts and training plans in ErgMaster"
};

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Workouts</p>
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Build a session that fits.</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">Saved workouts and training plans will appear here.</p>
      <div className="mt-16 grid gap-5 sm:grid-cols-2">
        <div className="h-44 rounded-2xl bg-[#0d3b66]" />
        <div className="h-44 rounded-2xl bg-[#f7fbff] shadow-[0_16px_50px_rgba(0,0,0,0.2)]" />
      </div>
    </section>
  );
}
