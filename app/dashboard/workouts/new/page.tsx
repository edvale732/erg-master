import { getExercises } from "@/app/lib/actions/exercises";
import TemplateForm from "@/app/ui/workouts/template-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Template",
  description: "Create a new strength training template in ErgMaster"
};

export default async function Page() {
  const exercises = await getExercises();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">New template</h1>
      <TemplateForm exercises={exercises} />
    </section>
  );
}
