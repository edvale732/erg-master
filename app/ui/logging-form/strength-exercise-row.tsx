import type { Exercise } from "@/app/lib/actions/exercises";
import type { StrengthSet } from "@/app/lib/actions/strength-sessions";
import type { WeightUnit } from "@/app/lib/actions/weight";
import { inputClassName } from "./interval-row";

const KG_TO_LB = 2.20462;

export type SetInput = Partial<StrengthSet>;
export type ExerciseInput = { id?: string; exerciseId?: string; sets: SetInput[] };

type StrengthExerciseRowProps = {
  exercise: ExerciseInput;
  index: number;
  exercises: Exercise[];
  weightUnit: WeightUnit;
  isDeleting: boolean;
  onExerciseChange: (index: number, exerciseId: string) => void;
  onSetChange: (index: number, setIndex: number, field: keyof StrengthSet, value: number | null) => void;
  onAddSet: (index: number) => void;
  onRemoveSet: (index: number, setIndex: number, setId?: string) => void;
  onRemoveExercise: (index: number, exerciseEntryId?: string) => void;
};

const toDisplayWeight = (weightKg: number | undefined, unit: WeightUnit) => {
  if (weightKg === undefined) return "";
  return (unit === "lb" ? weightKg * KG_TO_LB : weightKg).toString();
};

const toWeightKg = (value: string, unit: WeightUnit) => {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return unit === "lb" ? parsed / KG_TO_LB : parsed;
};

export function StrengthExerciseRow({
  exercise,
  index,
  exercises,
  weightUnit,
  isDeleting,
  onExerciseChange,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: StrengthExerciseRowProps) {
  const groupedExercises = exercises.reduce<Record<string, Exercise[]>>((groups, item) => {
    (groups[item.muscleGroup] ??= []).push(item);
    return groups;
  }, {});

  return (
    <div className="rounded-xl border border-[#c8dced] p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1 text-xs font-semibold uppercase tracking-wide text-[#55708f]">
          Exercise
          <select
            className={inputClassName}
            required
            value={exercise.exerciseId ?? ""}
            onChange={(event) => onExerciseChange(index, event.target.value)}
          >
            <option value="" disabled>Select an exercise</option>
            {Object.entries(groupedExercises).map(([muscleGroup, groupExercises]) => (
              <optgroup key={muscleGroup} label={muscleGroup}>
                {groupExercises.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-[#d94c4c] text-[#d94c4c] transition-colors hover:bg-[#fff0f0] disabled:opacity-50"
          aria-label="Delete exercise"
          title="Delete exercise"
          disabled={isDeleting}
          onClick={() => onRemoveExercise(index, exercise.id)}
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
          </svg>
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div key={set.id ?? setIndex} className="grid gap-3 rounded-lg bg-[#f0f6fc] p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
              Reps
              <input className={`${inputClassName} max-w-[110px]`} type="number" placeholder="reps" min="1" required value={set.reps ?? ""} onChange={(event) => onSetChange(index, setIndex, "reps", event.target.value ? Number(event.target.value) : null)} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
              Weight ({weightUnit})
              <input className={`${inputClassName} max-w-[110px]`} type="number" step="0.5" min="0" placeholder={weightUnit} required value={toDisplayWeight(set.weightKg, weightUnit)} onChange={(event) => onSetChange(index, setIndex, "weightKg", toWeightKg(event.target.value, weightUnit))} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
              Rest (sec)
              <input className={`${inputClassName} max-w-[110px]`} type="number" min="0" placeholder="sec" value={set.restTimeSeconds ?? ""} onChange={(event) => onSetChange(index, setIndex, "restTimeSeconds", event.target.value ? Number(event.target.value) : null)} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
              RPE
              <input className={`${inputClassName} max-w-[110px]`} type="number" step="0.5" min="0" max="10" placeholder="RPE" value={set.rpe ?? ""} onChange={(event) => onSetChange(index, setIndex, "rpe", event.target.value ? Number(event.target.value) : null)} />
            </label>
            <button type="button" className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-[#d94c4c] text-[#d94c4c] transition-colors hover:bg-[#fff0f0] disabled:opacity-50" aria-label="Delete set" title="Delete set" disabled={isDeleting} onClick={() => onRemoveSet(index, setIndex, set.id)}>
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="mt-3 text-sm font-semibold text-[#1f6fd1]" onClick={() => onAddSet(index)}>Add set</button>
    </div>
  );
}
