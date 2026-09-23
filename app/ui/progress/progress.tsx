import { Suspense } from "react";
import { formatDistance, getStreakStats, getWeeks } from "./helpers";
import { getSessionPredictions, getSessions, getWeightData } from "./data";
import { StreakSection } from "./streak-section";
import { PredictionSection } from "./prediction-section";
import { DistanceChart } from "./distance-chart";
import { WeightChart } from "./weight-chart";
import {
  ChartSkeleton,
  SectionSkeleton,
  SummaryCardsSkeleton,
} from "@/app/ui/skeletons/progress-skeleton";

async function SummaryCards() {
  const sessions = await getSessions();
  const weeks = getWeeks(sessions);
  const totalDistance = weeks.reduce((sum, week) => sum + week.distance, 0);
  const currentWeek = weeks[weeks.length - 1];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="h-36 rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]"><p className="text-sm text-[#b5d3ef]">This week</p><p className="mt-6 text-4xl font-semibold">{formatDistance(currentWeek.distance)}</p><p className="mt-2 text-sm text-[#dceeff]">rowing distance</p></div>
      <div className="h-36 rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]"><p className="text-sm text-[#55708f]">Last eight weeks</p><p className="mt-6 text-4xl font-semibold text-[#071a33]">{formatDistance(totalDistance)}</p><p className="mt-2 text-sm text-[#55708f]">total distance rowed</p></div>
    </div>
  );
}

async function StreakSectionData() {
  const sessions = await getSessions();
  return <StreakSection streaks={getStreakStats(sessions)} />;
}

async function PredictionSectionData() {
  const predictions = await getSessionPredictions();
  return <PredictionSection predictions={predictions} />;
}

async function DistanceChartData() {
  const sessions = await getSessions();
  return <DistanceChart weeks={getWeeks(sessions)} sessionsCount={sessions.length} />;
}

async function WeightChartData() {
  const { entries, unit } = await getWeightData();
  return <WeightChart entries={entries} unit={unit} />;
}

export default function ProgressWidgets() {
  return (
    <div className="mt-14">
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryCards />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <StreakSectionData />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PredictionSectionData />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <DistanceChartData />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <WeightChartData />
      </Suspense>
    </div>
  );
}
