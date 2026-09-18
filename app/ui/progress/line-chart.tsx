export const CHART_BOUNDS = { left: 72, right: 760, top: 46, bottom: 236 };

type Point = { x: number; y: number };

type LineChartProps = {
  points: Point[];
  pointKeys: string[];
  pointTitles: string[];
  yAxisLabels: [string, string, string];
  xLabels: { key: string; label: string }[];
  ariaLabel: string;
  showArea?: boolean;
};

// Shared SVG line-chart renderer used by the distance and weight trend charts.
export function LineChart({ points, pointKeys, pointTitles, yAxisLabels, xLabels, ariaLabel, showArea }: LineChartProps) {
  const { left, right, top, bottom } = CHART_BOUNDS;
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = showArea ? `${left},${bottom} ${linePoints} ${right},${bottom}` : null;

  return (
    <div className="mt-10" role="img" aria-label={ariaLabel}>
      <svg className="h-auto w-full" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">
        {[top, (top + bottom) / 2, bottom].map((y) => <line key={y} x1={left} x2={right} y1={y} y2={y} stroke="#c8dced" strokeWidth="1" />)}
        <text x="4" y={top + 4} fill="#55708f" fontSize="12">{yAxisLabels[0]}</text>
        <text x="4" y={(top + bottom) / 2 + 4} fill="#55708f" fontSize="12">{yAxisLabels[1]}</text>
        <text x="4" y={bottom + 4} fill="#55708f" fontSize="12">{yAxisLabels[2]}</text>
        {areaPoints && <polygon points={areaPoints} fill="#2f80ed" fillOpacity="0.12" />}
        <polyline points={linePoints} fill="none" stroke="#2f80ed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        {points.map((point, index) => (
          <circle key={pointKeys[index]} cx={point.x} cy={point.y} r="6" fill="#f7fbff" stroke="#2f80ed" strokeWidth="4">
            <title>{pointTitles[index]}</title>
          </circle>
        ))}
      </svg>
      <div className="grid gap-2 text-center text-xs text-[#55708f]" style={{ gridTemplateColumns: `repeat(${xLabels.length}, minmax(0, 1fr))` }}>
        {xLabels.map((label) => <span key={label.key}>{label.label}</span>)}
      </div>
    </div>
  );
}
