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
} from "@/app/lib/actions";

const initialState: State = {};

const inputClassName =
  "mt-2 w-full rounded-xl border border-[#2d4e73] bg-[#102f55] px-4 py-3 text-[#f7fbff] outline-none transition focus:border-[#69b3ff] focus:ring-2 focus:ring-[#69b3ff]/20";

function FieldError({ errors, field }: { errors?: State["errors"]; field: string }) {
  const message = errors?.[field]?.[0];

  return message ? <p className="mt-2 text-sm text-[#ff9b9b]">{message}</p> : null;
}

export default function LoggingForm({ session }: { session?: RowingSessionWithIntervals }) {
  const action = session ? updateRowingSession.bind(null, session.id) : createRowingSession;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [intervals, setIntervals] = useState<Partial<RowingInterval>[]>(session?.intervals ?? [{}]);
  const [isDeleting, startDeleting] = useTransition();
  const router = useRouter();

  const removeInterval = (index: number, intervalId?: string) => {
    if (!window.confirm("Delete this interval?")) return;

    startDeleting(async () => {
      if (intervalId) {
        const result = await deleteRowingInterval(intervalId);
        if (result?.message) return;
      }
      setIntervals((current) => current.filter((_, itemIndex) => itemIndex !== index));
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
    <form action={formAction} className="mt-16 max-w-3xl rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:p-8">
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

        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-[#294a6d]">Intervals</p>
          <input type="hidden" name="intervals" value={JSON.stringify(intervals)} />
          <div className="mt-3 space-y-3">
            {intervals.map((interval, index) => (
              <div className="grid gap-3 rounded-xl border border-[#c8dced] p-4 sm:grid-cols-6" key={interval.id ?? index}>
                <input className={inputClassName} type="number" placeholder="Distance (m)" min="1" required value={interval.distance ?? ""} onChange={(event) => setIntervals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, intervalNumber: index + 1, distance: Number(event.target.value) } : item))} />
                <input className={inputClassName} type="number" placeholder="Time (seconds)" min="1" required value={interval.timeSeconds ?? ""} onChange={(event) => setIntervals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, intervalNumber: index + 1, timeSeconds: Number(event.target.value) } : item))} />
                <input className={inputClassName} type="number" placeholder="Avg stroke rate" min="1" value={interval.avgStrokeRate ?? ""} onChange={(event) => setIntervals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, avgStrokeRate: event.target.value ? Number(event.target.value) : null } : item))} />
                <input className={inputClassName} type="number" placeholder="Avg watts" min="0" value={interval.avgWatts ?? ""} onChange={(event) => setIntervals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, avgWatts: event.target.value ? Number(event.target.value) : null } : item))} />
                <input className={inputClassName} type="number" placeholder="Rest (seconds)" min="0" value={interval.restTimeSeconds ?? ""} onChange={(event) => setIntervals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, restTimeSeconds: event.target.value ? Number(event.target.value) : null } : item))} />
                <button type="button" className="mt-2 cursor-pointer flex h-12 w-12 items-center justify-center self-end justify-self-end rounded-xl border border-[#d94c4c] text-[#d94c4c] transition-colors hover:bg-[#fff0f0] disabled:opacity-50" aria-label="Delete interval" title="Delete interval" disabled={isDeleting} onClick={() => removeInterval(index, interval.id)}>
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5M14 11v5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 text-sm font-semibold text-[#1f6fd1]" onClick={() => setIntervals((current) => [...current, { intervalNumber: current.length + 1 }])}>Add interval</button>
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