import { getRowingSessions } from "@/app/lib/actions";

const WEEK_COUNT = 8;

type Week = { label: string; start: Date; distance: number };

const startOfWeek = (date: Date) => {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatDistance = (distance: number) =>
  distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance.toLocaleString()} m`;

const getWeeks = (sessions: Awaited<ReturnType<typeof getRowingSessions>>): Week[] => {
  const currentWeek = startOfWeek(new Date());
  const weeks = Array.from({ length: WEEK_COUNT }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (WEEK_COUNT - index - 1) * 7);
    return { label: start.toLocaleDateString("en", { month: "short", day: "numeric" }), start, distance: 0 };
  });
  const weeksByStart = new Map(weeks.map((week) => [dateKey(week.start), week]));

  for (const session of sessions) {
    const sessionWeek = startOfWeek(new Date(`${session.sessionDate.slice(0, 10)}T00:00:00`));
    const week = weeksByStart.get(dateKey(sessionWeek));
    if (week) week.distance += session.totalDistance;
  }

  return weeks;
};

export default async function Page() {
  const sessions = await getRowingSessions();
  const weeks = getWeeks(sessions);
  const totalDistance = weeks.reduce((sum, week) => sum + week.distance, 0);
  const currentWeek = weeks[weeks.length - 1];
  const maxDistance = Math.max(...weeks.map((week) => week.distance), 1);
  const chartLeft = 72;
  const chartRight = 760;
  const chartTop = 46;
  const chartBottom = 236;
  const chartPoints = weeks.map((week, index) => ({
    x: chartLeft + index * ((chartRight - chartLeft) / (WEEK_COUNT - 1)),
    y: chartBottom - (week.distance / maxDistance) * (chartBottom - chartTop),
  }));
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${chartLeft},${chartBottom} ${linePoints} ${chartRight},${chartBottom}`;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Progress</p>
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">See how your training is moving.</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">A clear view of the distance you have rowed each week.</p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]"><p className="text-sm text-[#b5d3ef]">This week</p><p className="mt-6 text-4xl font-semibold">{formatDistance(currentWeek.distance)}</p><p className="mt-2 text-sm text-[#dceeff]">rowing distance</p></div>
        <div className="rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]"><p className="text-sm text-[#55708f]">Last eight weeks</p><p className="mt-6 text-4xl font-semibold text-[#071a33]">{formatDistance(totalDistance)}</p><p className="mt-2 text-sm text-[#55708f]">total distance rowed</p></div>
      </div>

      <figure className="mt-5 rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:p-8">
        <figcaption className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-lg font-semibold text-[#071a33]">Weekly distance</p><p className="mt-1 text-sm text-[#55708f]">Meters rowed, Monday through Sunday</p></div><p className="text-sm font-semibold text-[#1f6fd1]">{sessions.length} {sessions.length === 1 ? "session" : "sessions"}</p></figcaption>
        {sessions.length === 0 ? <div className="mt-10 flex min-h-56 items-center justify-center rounded-xl border border-dashed border-[#9db8d3] px-6 text-center text-[#55708f]">Your weekly distance will appear here after your first logged session.</div> : <div className="mt-10" role="img" aria-label="Line chart showing rowing distance for the last eight weeks">
          <svg className="h-auto w-full" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">
            {[chartTop, (chartTop + chartBottom) / 2, chartBottom].map((y) => <line key={y} x1={chartLeft} x2={chartRight} y1={y} y2={y} stroke="#c8dced" strokeWidth="1" />)}
            <text x="4" y={chartTop + 4} fill="#55708f" fontSize="12">{formatDistance(maxDistance)}</text>
            <text x="4" y={(chartTop + chartBottom) / 2 + 4} fill="#55708f" fontSize="12">{formatDistance(maxDistance / 2)}</text>
            <text x="4" y={chartBottom + 4} fill="#55708f" fontSize="12">0 m</text>
            <polygon points={areaPoints} fill="#2f80ed" fillOpacity="0.12" />
            <polyline points={linePoints} fill="none" stroke="#2f80ed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            {chartPoints.map((point, index) => <circle key={weeks[index].label} cx={point.x} cy={point.y} r="6" fill="#f7fbff" stroke="#2f80ed" strokeWidth="4"><title>{`${weeks[index].label}: ${formatDistance(weeks[index].distance)}`}</title></circle>)}
          </svg>
          <div className="grid grid-cols-8 gap-2 text-center text-xs text-[#55708f]">
            {weeks.map((week) => <span key={dateKey(week.start)}>{week.label}</span>)}
          </div>
        </div>}
      </figure>
    </section>
  );
}
