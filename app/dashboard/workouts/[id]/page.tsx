import { notFound } from "next/navigation";
import { getStrengthTemplate } from "@/app/lib/actions/strength-templates";
import { getExercises } from "@/app/lib/actions/exercises";
import TemplateForm from "@/app/ui/workouts/template-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Template",
  description: "Edit a strength training template in ErgMaster"
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [template, exercises] = await Promise.all([getStrengthTemplate(id), getExercises()]);

  if (!template) notFound();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Edit template</h1>
      <TemplateForm template={template} exercises={exercises} />
    </section>
  );
}
