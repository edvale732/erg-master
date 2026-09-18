import { ChartFigure } from "./chart-figure";
import { CHART_BOUNDS, LineChart } from "./line-chart";
import { dateKey, formatDistance, type Week } from "./helpers";

export function DistanceChart({ weeks, sessionsCount }: { weeks: Week[]; sessionsCount: number }) {
  const { left, right, top, bottom } = CHART_BOUNDS;
  const maxDistance = Math.max(...weeks.map((week) => week.distance), 1);
  const points = weeks.map((week, index) => ({
    x: left + index * ((right - left) / (weeks.length - 1)),
    y: bottom - (week.distance / maxDistance) * (bottom - top),
  }));

  return (
    <ChartFigure
      title="Weekly distance"
      subtitle="Meters rowed, Monday through Sunday"
      badge={<p className="text-sm font-semibold text-[#1f6fd1]">{sessionsCount} {sessionsCount === 1 ? "session" : "sessions"}</p>}
      isEmpty={sessionsCount === 0}
      emptyMessage="Your weekly distance will appear here after your first logged session."
    >
      <LineChart
        points={points}
        pointKeys={weeks.map((week) => dateKey(week.start))}
        pointTitles={weeks.map((week) => `${week.label}: ${formatDistance(week.distance)}`)}
        yAxisLabels={[formatDistance(maxDistance), formatDistance(maxDistance / 2), "0 m"]}
        xLabels={weeks.map((week) => ({ key: dateKey(week.start), label: week.label }))}
        ariaLabel="Line chart showing rowing distance for the last eight weeks"
        showArea
      />
    </ChartFigure>
  );
}
