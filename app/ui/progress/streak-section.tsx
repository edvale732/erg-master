import type { StreakStats } from "./helpers";

export function StreakSection({ streaks }: { streaks: StreakStats }) {
  return (
    <section className="mt-5 rounded-2xl bg-[#e4f1fc] p-6 text-[#071a33] sm:p-8" aria-labelledby="streaks-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold" id="streaks-heading">Streaks</p>
          <p className="mt-1 text-sm text-[#55708f]">Keep showing up, one session at a time.</p>
        </div>
        <p className="text-sm font-semibold text-[#1f6fd1]">{streaks.activeDays} active {streaks.activeDays === 1 ? "day" : "days"}</p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl bg-[#0d3b66] p-5 text-[#f7fbff]">
          <p className="text-sm text-[#b5d3ef]">Current streak</p>
          <p className="mt-4 text-4xl font-semibold">{streaks.current} <span className="text-lg font-normal text-[#dceeff]">{streaks.current === 1 ? "day" : "days"}</span></p>
          <p className="mt-2 text-sm text-[#dceeff]">{streaks.current > 0 ? "You are on a roll." : "Log a session today to start one."}</p>
        </div>
        <div className="rounded-xl bg-[#f7fbff] p-5 shadow-[0_10px_30px_rgba(20,75,120,0.12)]">
          <p className="text-sm text-[#55708f]">Longest streak</p>
          <p className="mt-4 text-4xl font-semibold">{streaks.longest} <span className="text-lg font-normal text-[#55708f]">{streaks.longest === 1 ? "day" : "days"}</span></p>
          <p className="mt-2 text-sm text-[#55708f]">Your personal best so far.</p>
        </div>
      </div>
    </section>
  );
}
