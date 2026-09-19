import type { RowingInterval } from "@/app/lib/actions/rowing-sessions";

export const inputClassName =
  "mt-2 w-full rounded-xl border border-[#2d4e73] bg-[#102f55] px-4 py-3 text-[#f7fbff] outline-none transition focus:border-[#69b3ff] focus:ring-2 focus:ring-[#69b3ff]/20";

type IntervalRowProps = {
  interval: Partial<RowingInterval>;
  index: number;
  timeValue: string;
  isSingle: boolean;
  isDeleting: boolean;
  onFieldChange: (index: number, field: keyof RowingInterval, value: number | null) => void;
  onTimeChange: (index: number, value: string) => void;
  onRemove: (index: number, intervalId?: string) => void;
};

export function IntervalRow({ interval, index, timeValue, isSingle, isDeleting, onFieldChange, onTimeChange, onRemove }: IntervalRowProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#c8dced] p-4 sm:grid-cols-[1.1fr_1.1fr_1fr_1fr_1fr_auto] sm:items-end">
      <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
        Distance
        <input className={`${inputClassName} max-w-[150px]`} type="number" placeholder="m" min="1" required value={interval.distance ?? ""} onChange={(event) => onFieldChange(index, "distance", event.target.value ? Number(event.target.value) : null)} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
        Time
        <input
          className={`${inputClassName} max-w-[150px]`}
          type="text"
          inputMode="numeric"
          placeholder="HH:MM:SS"
          required
          value={timeValue}
          onChange={(event) => onTimeChange(index, event.target.value)}
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
        Stroke rate
        <input className={`${inputClassName} max-w-[130px]`} type="number" placeholder="spm" min="1" value={interval.avgStrokeRate ?? ""} onChange={(event) => onFieldChange(index, "avgStrokeRate", event.target.value ? Number(event.target.value) : null)} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
        Avg watts
        <input className={`${inputClassName} max-w-[130px]`} type="number" placeholder="W" min="0" value={interval.avgWatts ?? ""} onChange={(event) => onFieldChange(index, "avgWatts", event.target.value ? Number(event.target.value) : null)} />
      </label>
      {!isSingle && <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
        Rest
        <input className={`${inputClassName} max-w-[130px]`} type="number" placeholder="sec" min="0" value={interval.restTimeSeconds ?? ""} onChange={(event) => onFieldChange(index, "restTimeSeconds", event.target.value ? Number(event.target.value) : null)} />
      </label>}
      {!isSingle && <button type="button" className="mt-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-[#d94c4c] text-[#d94c4c] transition-colors hover:bg-[#fff0f0] disabled:opacity-50" aria-label="Delete interval" title="Delete interval" disabled={isDeleting} onClick={() => onRemove(index, interval.id)}>
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      </button>}
    </div>
  );
}
