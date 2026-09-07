const formatMinutes = (minutes: number) => `${minutes} min`;

type WeeklyActivityData = { label: string; date: string; minutes: number }[];

export function WeeklyStreak({ value }: { value: number }) {
  return (
    <div className="h-36 rounded-2xl bg-[#0d3b66] p-6 text-[#f7fbff]">
      <p className="text-sm text-[#b5d3ef]">Weekly streak</p>
      <p className="mt-5 text-5xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[#dceeff]">{value === 1 ? "week in a row" : "weeks in a row"}</p>
    </div>
  );
}

export function WeeklyActivity({ activity }: { activity: WeeklyActivityData }) {
  const maxActivity = Math.max(...activity.map((week) => week.minutes), 1);

  return (
    <figure className="h-72 rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]" aria-labelledby="weekly-activity-heading">
            <figcaption className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-lg font-semibold" id="weekly-activity-heading">Weekly activity</p>
                <p className="mt-1 text-sm text-[#55708f]">Time rowed over the last eight weeks</p>
              </div>
              <p className="text-sm font-semibold text-[#1f6fd1]">{formatMinutes(activity.reduce((sum, week) => sum + week.minutes, 0))}</p>
            </figcaption>
            <div className="mt-8" role="img" aria-label="Line chart showing rowing time for each of the last eight weeks">
              <svg className="h-36 w-full" viewBox="0 0 700 150" preserveAspectRatio="none" aria-hidden="true">
                {[20, 70, 120].map((y) => <line key={y} x1="18" x2="690" y1={y} y2={y} stroke="#c8dced" strokeWidth="1" />)}
                <polyline
                  points={activity.map((week, index) => `${18 + index * 96},${120 - (week.minutes / maxActivity) * 100}`).join(" ")}
                  fill="none"
                  stroke="#2f80ed"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {activity.map((week, index) => {
                  const x = 18 + index * 96;
                  const y = 120 - (week.minutes / maxActivity) * 100;
                  return (
                    <g key={week.date}>
                      <circle cx={x} cy={y} r="5" fill="#f7fbff" stroke="#2f80ed" strokeWidth="3">
                        <title>{`${week.label}: ${formatMinutes(week.minutes)}`}</title>
                      </circle>
                      <text x={x} y="143" textAnchor="middle" fill="#55708f" fontSize="12">{week.label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </figure>
  );
}