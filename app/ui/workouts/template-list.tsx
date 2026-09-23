"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteStrengthTemplate, type StrengthTemplateWithExercises } from "@/app/lib/actions/strength-templates";

export default function TemplateList({ templates }: { templates: StrengthTemplateWithExercises[] }) {
  const [isDeleting, startDeleting] = useTransition();

  const removeTemplate = (id: string) => {
    if (!window.confirm("Delete this template?")) return;
    startDeleting(async () => {
      await deleteStrengthTemplate(id);
    });
  };

  if (templates.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-[#f7fbff] p-8 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
        <p className="text-lg font-semibold text-[#071a33]">No templates yet.</p>
        <p className="mt-2 text-[#55708f]">Save a strength workout as a template to reuse it later.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {templates.map((template) => (
        <div key={template.id} className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[#f7fbff] p-4 text-[#071a33] shadow-[0_16px_50px_rgba(0,0,0,0.2)] sm:flex-nowrap sm:p-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-[#071a33]">{template.name}</h2>
            <p className="mt-1 text-sm text-[#55708f]">
              {template.exercises.length === 0
                ? "No exercises yet"
                : template.exercises.map((exercise) => exercise.exerciseName).join(", ")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/log?template=${template.id}`}
              className="rounded-xl bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6fd1]"
            >
              Start session
            </Link>
            <Link
              href={`/dashboard/workouts/${template.id}`}
              className="rounded-xl border border-[#9db8d3] px-4 py-2.5 text-sm font-semibold text-[#294a6d] transition-colors hover:border-[#557da6] hover:text-[#071a33]"
            >
              Edit
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-[#d94c4c] px-4 py-2.5 text-sm font-semibold text-[#b93636] transition-colors hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDeleting}
              onClick={() => removeTemplate(template.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
