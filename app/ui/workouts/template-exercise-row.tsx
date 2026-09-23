import type { Exercise } from "@/app/lib/actions/exercises";
import { inputClassName } from "@/app/ui/logging-form/interval-row";

export type TemplateExerciseInput = { id?: string; exerciseId?: string; targetSets?: number };

type TemplateExerciseRowProps = {
  exercise: TemplateExerciseInput;
  index: number;
  exercises: Exercise[];
  onExerciseChange: (index: number, exerciseId: string) => void;
  onTargetSetsChange: (index: number, targetSets: number | null) => void;
  onRemove: (index: number) => void;
};

export function TemplateExerciseRow({
  exercise,
  index,
  exercises,
  onExerciseChange,
  onTargetSetsChange,
  onRemove,
}: TemplateExerciseRowProps) {
  const groupedExercises = exercises.reduce<Record<string, Exercise[]>>((groups, item) => {
    (groups[item.muscleGroup] ??= []).push(item);
    return groups;
  }, {});

  return (
    <div className="grid gap-3 rounded-xl border border-[#c8dced] p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
      <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
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
      <label className="text-xs font-semibold uppercase tracking-wide text-[#55708f]">
        Target sets
        <input
          className={`${inputClassName} max-w-[120px]`}
          type="number"
          min="1"
          placeholder="sets"
          required
          value={exercise.targetSets ?? ""}
          onChange={(event) => onTargetSetsChange(index, event.target.value ? Number(event.target.value) : null)}
        />
      </label>
      <button
        type="button"
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-[#d94c4c] text-[#d94c4c] transition-colors hover:bg-[#fff0f0]"
        aria-label="Remove exercise"
        title="Remove exercise"
        onClick={() => onRemove(index)}
      >
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      </button>
    </div>
  );
}
