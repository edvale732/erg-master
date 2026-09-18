"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createRowingSession,
  deleteRowingInterval,
  deleteRowingSession,
  updateRowingSession,
  type RowingSessionWithIntervals,
  type RowingInterval,
  type State,
} from "@/app/lib/actions/rowing-sessions";
import { IntervalRow, inputClassName } from "./logging-form/interval-row";
import { formatTimeInput, normalizeTimeInput, parseTimeInput } from "./logging-form/time-input";

const initialState: State = {};

type LogMode = "single-distance" | "single-time" | "timed-intervals" | "distance-intervals";

const sessionTypeToLogMode: Record<NonNullable<RowingSessionWithIntervals["sessionType"]>, LogMode> = {
  single_distance: "single-distance",
  single_time: "single-time",
  timed_intervals: "timed-intervals",
  distance_intervals: "distance-intervals",
};

function FieldError({ errors, field }: { errors?: State["errors"]; field: string }) {
  const message = errors?.[field]?.[0];

  return message ? <p className="mt-2 text-sm text-[#ff9b9b]">{message}</p> : null;
}

export default function LoggingForm({ session }: { session?: RowingSessionWithIntervals }) {
  const action = session ? updateRowingSession.bind(null, session.id) : createRowingSession;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [intervals, setIntervals] = useState<Partial<RowingInterval>[]>(session?.intervals ?? [{}]);
  const [timeInputs, setTimeInputs] = useState<string[]>(session?.intervals.map((interval) => formatTimeInput(interval.timeSeconds)) ?? [""]);
  const [mode, setMode] = useState<LogMode>(session ? sessionTypeToLogMode[session.sessionType] : "distance-intervals");
  const [isDeleting, startDeleting] = useTransition();
  const router = useRouter();

  const isSingle = mode === "single-distance" || mode === "single-time";

  const updateInterval = (index: number, field: keyof RowingInterval, value: number | null) => {
    setIntervals((current) => current.map((interval, itemIndex) => (
      itemIndex === index ? { ...interval, intervalNumber: index + 1, [field]: value } : interval
    )));
  };

  const updateTime = (index: number, value: string) => {
    const normalized = normalizeTimeInput(value);

    setTimeInputs((current) => current.map((time, itemIndex) => itemIndex === index ? normalized : time));
    setIntervals((current) => current.map((interval, itemIndex) => {
      if (itemIndex !== index) return interval;

      const timeSeconds = parseTimeInput(normalized);
      return { ...interval, timeSeconds };
    }));
  };

  const changeMode = (nextMode: LogMode) => {
    setMode(nextMode);
    setIntervals((current) => {
      const nextIntervals = nextMode === "single-distance" || nextMode === "single-time"
        ? [current[0] ?? {}]
        : current.length > 0 ? current : [{}];

      return nextIntervals.map((interval, index) => ({
        ...interval,
        intervalNumber: index + 1,
        distance: interval.distance,
        timeSeconds: interval.timeSeconds,
      }));
    });
    setTimeInputs((current) => {
      const nextTimeInputs = nextMode === "single-distance" || nextMode === "single-time"
        ? [current[0] ?? ""]
        : current.length > 0 ? current : [""];

      return nextTimeInputs.map((time) => time ?? "");
    });
  };

  const removeInterval = (index: number, intervalId?: string) => {
    if (!window.confirm("Delete this interval?")) return;

    startDeleting(async () => {
      if (intervalId) {
        const result = await deleteRowingInterval(intervalId);
        if (result?.message) return;
      }
      setIntervals((current) => current.filter((_, itemIndex) => itemIndex !== index));
      setTimeInputs((current) => current.filter((_, itemIndex) => itemIndex !== index));
    });
  };

  const removeSession = () => {
    if (!session || !window.confirm("Delete this entire session?")) return;
    startDeleting(async () => {
      await deleteRowingSession(session.id);
      router.push("/dashboard/history");
    });
  };

  return (
    <form action={formAction} className="mx-auto mt-16 max-w-3xl rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#294a6d]">
          Session date
          <input className={inputClassName} type="date" name="sessionDate" defaultValue={session?.sessionDate.slice(0, 10)} required />
          <FieldError errors={state.errors} field="sessionDate" />
        </label>

        <label className="text-sm font-semibold text-[#294a6d] sm:col-span-2">
          Notes
          <textarea className={`${inputClassName} min-h-32 resize-y`} name="notes" defaultValue={session?.notes ?? ""} placeholder="How did the session feel?" />
          <FieldError errors={state.errors} field="notes" />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-[#294a6d]">What are you logging?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {([
              ["single-distance", "Single distance"],
              ["single-time", "Single time"],
              ["timed-intervals", "Timed intervals"],
              ["distance-intervals", "Distance intervals"],
            ] as const).map(([value, label]) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#c8dced] p-4 text-sm font-semibold text-[#294a6d] transition has-[:checked]:border-[#2f80ed] has-[:checked]:bg-[#eaf4ff]" key={value}>
                <input className="h-4 w-4 accent-[#2f80ed]" type="radio" name="logMode" value={value} checked={mode === value} onChange={() => changeMode(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-[#294a6d]">{isSingle ? "Workout" : "Intervals"}</p>
          <input type="hidden" name="intervals" value={JSON.stringify(intervals)} />
          <div className="mt-3 space-y-3">
            {intervals.map((interval, index) => (
              <IntervalRow
                key={interval.id ?? index}
                interval={interval}
                index={index}
                timeValue={timeInputs[index] ?? ""}
                isSingle={isSingle}
                isDeleting={isDeleting}
                onFieldChange={updateInterval}
                onTimeChange={updateTime}
                onRemove={removeInterval}
              />
            ))}
          </div>
          {!isSingle && <button type="button" className="mt-3 text-sm font-semibold text-[#1f6fd1]" onClick={() => { setIntervals((current) => [...current, { intervalNumber: current.length + 1 }]); setTimeInputs((current) => [...current, ""]); }}>Add interval</button>}
        </div>
      </div>

      {state.message && <p className="mt-6 text-sm text-[#d94c4c]" role="alert">{state.message}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          className="cursor-pointer rounded-xl bg-[#2f80ed] px-6 py-3 font-semibold text-white transition hover:bg-[#1f6fd1] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving session..." : session ? "Update session" : "Save session"}
        </button>
        {session && (
          <Link
            className="rounded-xl border border-[#9db8d3] px-6 py-3 font-semibold text-[#294a6d] transition-colors hover:border-[#557da6] hover:text-[#071a33]"
            href="/dashboard/history"
          >
            Cancel
          </Link>
        )}
        {session && (
          <button
            className="ml-auto cursor-pointer rounded-xl border border-[#d94c4c] px-6 py-3 font-semibold text-[#b93636] transition-colors hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={isPending || isDeleting}
            onClick={removeSession}
          >
            Delete session
          </button>
        )}
      </div>
    </form>
  );
}