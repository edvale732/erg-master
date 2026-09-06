"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createRowingSession,
  updateRowingSession,
  type RowingSession,
  type State,
} from "@/app/lib/actions";

const initialState: State = {};

const inputClassName =
  "mt-2 w-full rounded-xl border border-[#c3d2c8] bg-[#f7faf6] px-4 py-3 text-[#173b35] outline-none transition focus:border-[#cf633f] focus:ring-2 focus:ring-[#cf633f]/20";

function FieldError({ errors, field }: { errors?: State["errors"]; field: string }) {
  const message = errors?.[field]?.[0];

  return message ? <p className="mt-2 text-sm text-[#b34e31]">{message}</p> : null;
}

export default function LoggingForm({ session }: { session?: RowingSession }) {
  const action = session ? updateRowingSession.bind(null, session.id) : createRowingSession;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-16 max-w-3xl rounded-2xl bg-[#fffdf7] p-6 shadow-[0_16px_50px_rgba(23,59,53,0.08)] sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#36584f]">
          Session date
          <input className={inputClassName} type="date" name="sessionDate" defaultValue={session?.sessionDate.slice(0, 10)} required />
          <FieldError errors={state.errors} field="sessionDate" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Workout type
          <input className={inputClassName} type="text" name="workoutType" defaultValue={session?.workoutType} maxLength={50} required />
          <FieldError errors={state.errors} field="workoutType" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Total distance (meters)
          <input className={inputClassName} type="number" name="totalDistance" defaultValue={session?.totalDistance?.toString()} min="1" step="1" required />
          <FieldError errors={state.errors} field="totalDistance" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Total time (seconds)
          <input className={inputClassName} type="number" name="totalTimeSeconds" defaultValue={session?.totalTimeSeconds} min="1" step="1" required />
          <FieldError errors={state.errors} field="totalTimeSeconds" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Average watts
          <input className={inputClassName} type="number" name="avgWatts" defaultValue={session?.avgWatts ?? ""} min="0" step="1" />
          <FieldError errors={state.errors} field="avgWatts" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Average stroke rate
          <input className={inputClassName} type="number" name="avgStrokeRate" defaultValue={session?.avgStrokeRate ?? ""} min="1" step="1" />
          <FieldError errors={state.errors} field="avgStrokeRate" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Target pace (seconds)
          <input className={inputClassName} type="number" name="targetPaceSeconds" defaultValue={session?.targetPaceSeconds ?? ""} min="1" step="1" />
          <FieldError errors={state.errors} field="targetPaceSeconds" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Target stroke rate
          <input className={inputClassName} type="number" name="targetStrokeRate" defaultValue={session?.targetStrokeRate ?? ""} min="1" step="1" />
          <FieldError errors={state.errors} field="targetStrokeRate" />
        </label>

        <label className="text-sm font-semibold text-[#36584f]">
          Drag factor
          <input className={inputClassName} type="number" name="dragFactor" defaultValue={session?.dragFactor ?? ""} min="1" step="1" />
          <FieldError errors={state.errors} field="dragFactor" />
        </label>

        <label className="text-sm font-semibold text-[#36584f] sm:col-span-2">
          Notes
          <textarea className={`${inputClassName} min-h-32 resize-y`} name="notes" defaultValue={session?.notes ?? ""} placeholder="How did the session feel?" />
          <FieldError errors={state.errors} field="notes" />
        </label>
      </div>

      {state.message && <p className="mt-6 text-sm text-[#b34e31]" role="alert">{state.message}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          className="rounded-xl bg-[#cf633f] px-6 py-3 font-semibold text-white transition hover:bg-[#b34e31] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving session..." : session ? "Update session" : "Save session"}
        </button>
        {session && (
          <Link
            className="rounded-xl border border-[#c3d2c8] px-6 py-3 font-semibold text-[#36584f] transition-colors hover:border-[#829189] hover:text-[#173b35]"
            href="/dashboard/history"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}