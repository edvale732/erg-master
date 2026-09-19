import { getRowingSessionsWithIntervals } from "@/app/lib/actions/rowing-sessions";
import { getWeightEntries, getWeightUnit } from "@/app/lib/actions/weight";
import { getPredictions } from "@/app/lib/fastapi";
import { formatDistance, getStreakStats, getWeeks } from "./helpers";
import { StreakSection } from "./streak-section";
import { PredictionSection } from "./prediction-section";
import { DistanceChart } from "./distance-chart";
import { WeightChart } from "./weight-chart";

export default async function ProgressWidgets() {
  const sessions = await getRowingSessionsWithIntervals();
  const predictions = await getPredictions(sessions);
  const weightEntries = await getWeightEntries();
  const weightUnit = await getWeightUnit();
  const weeks = getWeeks(sessions);
  const streaks = getStreakStats(sessions);
  const totalDistance = weeks.reduce((sum, week) => sum + week.distance, 0);
  const currentWeek = weeks[weeks.length - 1];

  return (
    <div className="mt-14">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-36 rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]"><p className="text-sm text-[#b5d3ef]">This week</p><p className="mt-6 text-4xl font-semibold">{formatDistance(currentWeek.distance)}</p><p className="mt-2 text-sm text-[#dceeff]">rowing distance</p></div>
        <div className="h-36 rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]"><p className="text-sm text-[#55708f]">Last eight weeks</p><p className="mt-6 text-4xl font-semibold text-[#071a33]">{formatDistance(totalDistance)}</p><p className="mt-2 text-sm text-[#55708f]">total distance rowed</p></div>
      </div>

      <StreakSection streaks={streaks} />
      <PredictionSection predictions={predictions} />
      <DistanceChart weeks={weeks} sessionsCount={sessions.length} />
      <WeightChart entries={weightEntries} unit={weightUnit} />
    </div>
  );
}
