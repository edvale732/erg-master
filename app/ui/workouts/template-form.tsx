"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createStrengthTemplate,
  deleteStrengthTemplate,
  updateStrengthTemplate,
  type StrengthTemplateWithExercises,
  type State,
} from "@/app/lib/actions/strength-templates";
import type { Exercise } from "@/app/lib/actions/exercises";
import { inputClassName } from "@/app/ui/logging-form/interval-row";
import { TemplateExerciseRow, type TemplateExerciseInput } from "./template-exercise-row";

const initialState: State = {};

function FieldError({ errors, field }: { errors?: State["errors"]; field: string }) {
  const message = errors?.[field]?.[0];

  return message ? <p className="mt-2 text-sm text-[#ff9b9b]">{message}</p> : null;
}

const templateToExerciseInputs = (template?: StrengthTemplateWithExercises): TemplateExerciseInput[] => {
  if (!template || template.exercises.length === 0) return [{}];

  return template.exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    targetSets: exercise.targetSets,
  }));
};

export default function TemplateForm({
  template,
  exercises,
}: {
  template?: StrengthTemplateWithExercises;
  exercises: Exercise[];
}) {
  const action = template ? updateStrengthTemplate.bind(null, template.id) : createStrengthTemplate;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [exerciseInputs, setExerciseInputs] = useState<TemplateExerciseInput[]>(templateToExerciseInputs(template));
  const [isDeleting, startDeleting] = useTransition();
  const router = useRouter();

  const exercisesPayload = exerciseInputs.map((exercise, index) => ({
    exerciseId: exercise.exerciseId,
    exerciseOrder: index + 1,
    targetSets: exercise.targetSets,
  }));

  const setExercise = (index: number, exerciseId: string) => {
    setExerciseInputs((current) => current.map((exercise, itemIndex) => (
      itemIndex === index ? { ...exercise, exerciseId } : exercise
    )));
  };

  const setTargetSets = (index: number, targetSets: number | null) => {
    setExerciseInputs((current) => current.map((exercise, itemIndex) => (
      itemIndex === index ? { ...exercise, targetSets: targetSets ?? undefined } : exercise
    )));
  };

  const addExercise = () => {
    setExerciseInputs((current) => [...current, {}]);
  };

  const removeExercise = (index: number) => {
    setExerciseInputs((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeTemplate = () => {
    if (!template || !window.confirm("Delete this template?")) return;
    startDeleting(async () => {
      await deleteStrengthTemplate(template.id);
      router.push("/dashboard/workouts");
    });
  };

  return (
    <form action={formAction} className="mx-auto mt-16 max-w-3xl rounded-2xl bg-[#f7fbff] p-6 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:p-8">
      <label className="text-sm font-semibold text-[#294a6d]">
        Template name
        <input className={inputClassName} type="text" name="name" defaultValue={template?.name} placeholder="e.g. Push day" required />
        <FieldError errors={state.errors} field="name" />
      </label>

      <div className="mt-6">
        <p className="text-sm font-semibold text-[#294a6d]">Exercises</p>
        <input type="hidden" name="exercises" value={JSON.stringify(exercisesPayload)} />
        <div className="mt-3 space-y-3">
          {exerciseInputs.map((exercise, index) => (
            <TemplateExerciseRow
              key={exercise.id ?? index}
              exercise={exercise}
              index={index}
              exercises={exercises}
              onExerciseChange={setExercise}
              onTargetSetsChange={setTargetSets}
              onRemove={removeExercise}
            />
          ))}
        </div>
        <button type="button" className="mt-3 text-sm font-semibold text-[#1f6fd1]" onClick={addExercise}>Add exercise</button>
      </div>

      {state.message && <p className="mt-6 text-sm text-[#d94c4c]" role="alert">{state.message}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          className="cursor-pointer rounded-xl bg-[#2f80ed] px-6 py-3 font-semibold text-white transition hover:bg-[#1f6fd1] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving template..." : template ? "Update template" : "Save template"}
        </button>
        <Link
          className="rounded-xl border border-[#9db8d3] px-6 py-3 font-semibold text-[#294a6d] transition-colors hover:border-[#557da6] hover:text-[#071a33]"
          href="/dashboard/workouts"
        >
          Cancel
        </Link>
        {template && (
          <button
            className="ml-auto cursor-pointer rounded-xl border border-[#d94c4c] px-6 py-3 font-semibold text-[#b93636] transition-colors hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={isPending || isDeleting}
            onClick={removeTemplate}
          >
            Delete template
          </button>
        )}
      </div>
    </form>
  );
}
