import type { WeightEntry, WeightUnit } from "@/app/lib/actions";
import { ChartFigure } from "./chart-figure";
import { CHART_BOUNDS, LineChart } from "./line-chart";
import { formatShortDate, formatWeight, toDisplayWeight } from "./helpers";

export function WeightChart({ entries, unit }: { entries: WeightEntry[]; unit: WeightUnit }) {
  const { left, right, top, bottom } = CHART_BOUNDS;
  const latestEntry = entries.at(-1);
  const values = entries.map((entry) => toDisplayWeight(entry.weightKg, unit));
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const padding = (maxValue - minValue) * 0.1 || 1;
  const chartMin = minValue - padding;
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin || 1;
  const points = entries.map((entry, index) => ({
    x: left + index * ((right - left) / Math.max(entries.length - 1, 1)),
    y: bottom - ((values[index] - chartMin) / chartRange) * (bottom - top),
  }));

  return (
    <ChartFigure
      title="Weight trend"
      subtitle="Your logged body weight over time"
      badge={latestEntry && <p className="text-sm font-semibold text-[#1f6fd1]">{formatWeight(latestEntry.weightKg, unit)}</p>}
      isEmpty={entries.length === 0}
      emptyMessage="Your weight trend will appear here after your first logged weigh-in."
    >
      <LineChart
        points={points}
        pointKeys={entries.map((entry) => entry.id)}
        pointTitles={entries.map((entry) => `${formatShortDate(entry.recordedAt)}: ${formatWeight(entry.weightKg, unit)}`)}
        yAxisLabels={[`${chartMax.toFixed(1)} ${unit}`, `${((chartMax + chartMin) / 2).toFixed(1)} ${unit}`, `${chartMin.toFixed(1)} ${unit}`]}
        xLabels={entries.map((entry) => ({ key: entry.id, label: formatShortDate(entry.recordedAt) }))}
        ariaLabel="Line chart showing recent body weight entries"
      />
    </ChartFigure>
  );
}
