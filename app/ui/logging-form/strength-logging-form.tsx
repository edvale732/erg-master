"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createStrengthSession,
  deleteStrengthSession,
  deleteStrengthSessionExercise,
  updateStrengthSession,
  type StrengthSessionWithExercises,
  type StrengthSet,
  type State,
} from "@/app/lib/actions/strength-sessions";
import type { Exercise } from "@/app/lib/actions/exercises";
import type { StrengthTemplateWithExercises } from "@/app/lib/actions/strength-templates";
import type { WeightUnit } from "@/app/lib/actions/weight";
import { inputClassName } from "./interval-row";
import { StrengthExerciseRow, type ExerciseInput } from "./strength-exercise-row";

const initialState: State = {};

function FieldError({ errors, field }: { errors?: State["errors"]; field: string }) {
  const message = errors?.[field]?.[0];

  return message ? <p className="mt-2 text-sm text-[#ff9b9b]">{message}</p> : null;
}

const sessionToExerciseInputs = (session?: StrengthSessionWithExercises): ExerciseInput[] => {
  if (!session || session.exercises.length === 0) return [{ sets: [{}] }];

  return session.exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    sets: exercise.sets,
  }));
};

const templateToExerciseInputs = (template: StrengthTemplateWithExercises): ExerciseInput[] =>
  template.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sets: Array.from({ length: exercise.targetSets }, () => ({})),
  }));

export default function StrengthLoggingForm({
  session,
  exercises,
  weightUnit,
  templates = [],
  initialTemplateId,
}: {
  session?: StrengthSessionWithExercises;
  exercises: Exercise[];
  weightUnit: WeightUnit;
  templates?: StrengthTemplateWithExercises[];
  initialTemplateId?: string;
}) {
  const action = session ? updateStrengthSession.bind(null, session.id) : createStrengthSession;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const initialTemplate = !session ? templates.find((template) => template.id === initialTemplateId) : undefined;
  const [exerciseInputs, setExerciseInputs] = useState<ExerciseInput[]>(
    initialTemplate ? templateToExerciseInputs(initialTemplate) : sessionToExerciseInputs(session),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate?.id ?? "");
  const [isDeleting, startDeleting] = useTransition();
  const router = useRouter();

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (template) setExerciseInputs(templateToExerciseInputs(template));
  };

  const exercisesPayload = exerciseInputs.map((exercise, exerciseIndex) => ({
    exerciseId: exercise.exerciseId,
    exerciseOrder: exerciseIndex + 1,
    sets: exercise.sets.map((set, setIndex) => ({
      setNumber: setIndex + 1,
      reps: set.reps,
      weightKg: set.weightKg,
      restTimeSeconds: set.restTimeSeconds ?? null,
      rpe: set.rpe ?? null,
    })),
  }));

  const setExercise = (index: number, exerciseId: string) => {
    setExerciseInputs((current) => current.map((exercise, itemIndex) => (
      itemIndex === index ? { ...exercise, exerciseId } : exercise
    )));
  };

  const setSetField = (exerciseIndex: number, setIndex: number, field: keyof StrengthSet, value: number | null) => {
    setExerciseInputs((current) => current.map((exercise, itemIndex) => {
      if (itemIndex !== exerciseIndex) return exercise;

      return {
        ...exercise,
        sets: exercise.sets.map((set, itemSetIndex) => (
          itemSetIndex === setIndex ? { ...set, [field]: value } : set
        )),
      };
    }));
  };

  const addExercise = () => {
    setExerciseInputs((current) => [...current, { sets: [{}] }]);
  };

  const addSet = (exerciseIndex: number) => {
    setExerciseInputs((current) => current.map((exercise, itemIndex) => (
      itemIndex === exerciseIndex ? { ...exercise, sets: [...exercise.sets, {}] } : exercise
    )));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!window.confirm("Delete this set?")) return;

    setExerciseInputs((current) => current.map((exercise, itemIndex) => (
      itemIndex === exerciseIndex
        ? { ...exercise, sets: exercise.sets.filter((_, itemSetIndex) => itemSetIndex !== setIndex) }
        : exercise
    )));
  };

  const removeExercise = (exerciseIndex: number, exerciseEntryId?: string) => {
    if (!window.confirm("Delete this exercise?")) return;

    startDeleting(async () => {
      if (exerciseEntryId) {
        const result = await deleteStrengthSessionExercise(exerciseEntryId);
        if (result?.message) return;
      }
      setExerciseInputs((current) => current.filter((_, itemIndex) => itemIndex !== exerciseIndex));
    });
  };

  const removeSession = () => {
    if (!session || !window.confirm("Delete this entire session?")) return;
    startDeleting(async () => {
      await deleteStrengthSession(session.id);
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

        {!session && templates.length > 0 && (
          <label className="text-sm font-semibold text-[#294a6d] sm:col-span-2">
            Start from a template
            <select className={inputClassName} value={selectedTemplateId} onChange={(event) => applyTemplate(event.target.value)}>
              <option value="">None</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </label>
        )}

        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-[#294a6d]">Exercises</p>
          <input type="hidden" name="exercises" value={JSON.stringify(exercisesPayload)} />
          <div className="mt-3 space-y-3">
            {exerciseInputs.map((exercise, index) => (
              <StrengthExerciseRow
                key={exercise.id ?? index}
                exercise={exercise}
                index={index}
                exercises={exercises}
                weightUnit={weightUnit}
                isDeleting={isDeleting}
                onExerciseChange={setExercise}
                onSetChange={setSetField}
                onAddSet={addSet}
                onRemoveSet={removeSet}
                onRemoveExercise={removeExercise}
              />
            ))}
          </div>
          <button type="button" className="mt-3 text-sm font-semibold text-[#1f6fd1]" onClick={addExercise}>Add exercise</button>
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
