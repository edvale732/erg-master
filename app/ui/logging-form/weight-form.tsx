"use client";

import { useActionState } from "react";
import { createWeightEntry, type State, type WeightUnit } from "@/app/lib/actions/weight";
import { inputClassName } from "./interval-row";

const initialState: State = {};

function FieldError({ errors, field }: { errors?: State["errors"]; field: string }) {
  const message = errors?.[field]?.[0];

  return message ? <p className="mt-2 text-sm text-[#ff9b9b]">{message}</p> : null;
}

export default function WeightForm({ unit }: { unit: WeightUnit }) {
  const [state, formAction, isPending] = useActionState(createWeightEntry, initialState);

  return (
    <form action={formAction} className="mx-auto mt-16 max-w-3xl rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#294a6d]">
          Weight ({unit})
          <input className={inputClassName} type="number" name="weight" step="0.1" min="0" required />
          <FieldError errors={state.errors} field="weightKg" />
        </label>

        <label className="text-sm font-semibold text-[#294a6d]">
          Date
          <input className={inputClassName} type="date" name="recordedAt" defaultValue={new Date().toISOString().slice(0, 10)} required />
          <FieldError errors={state.errors} field="recordedAt" />
        </label>

        <label className="text-sm font-semibold text-[#294a6d] sm:col-span-2">
          Notes
          <textarea className={`${inputClassName} min-h-24 resize-y`} name="notes" placeholder="Anything worth noting?" />
          <FieldError errors={state.errors} field="notes" />
        </label>
      </div>

      {state.message && !state.errors && <p className="mt-6 text-sm font-semibold text-[#1f6fd1]">{state.message}</p>}

      <div className="mt-8 flex justify-end">
        <button type="submit" disabled={isPending} className="rounded-full bg-[#2f80ed] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,128,237,0.25)] transition hover:bg-[#1f6fd1] disabled:opacity-60">
          {isPending ? "Logging..." : "Log weight"}
        </button>
      </div>
    </form>
  );
}
