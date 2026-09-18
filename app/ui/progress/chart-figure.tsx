import type { ReactNode } from "react";

type ChartFigureProps = {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
};

// Shared figure/figcaption shell with an empty-state fallback for progress charts.
export function ChartFigure({ title, subtitle, badge, isEmpty, emptyMessage, children }: ChartFigureProps) {
  return (
    <figure className="mt-5 min-h-96 rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:p-8">
      <figcaption className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-[#071a33]">{title}</p>
          <p className="mt-1 text-sm text-[#55708f]">{subtitle}</p>
        </div>
        {badge}
      </figcaption>
      {isEmpty
        ? <div className="mt-10 flex min-h-56 items-center justify-center rounded-xl border border-dashed border-[#9db8d3] px-6 text-center text-[#55708f]">{emptyMessage}</div>
        : children}
    </figure>
  );
}
