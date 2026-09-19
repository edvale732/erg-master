import { getWeightUnit } from "@/app/lib/actions/weight";
import { getExercises } from "@/app/lib/actions/exercises";
import LogSwitcher from "@/app/ui/logging-form/log-switcher";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log",
  description: "Log your activities in ErgMaster"
};

export default async function Page() {
  const [weightUnit, exercises] = await Promise.all([getWeightUnit(), getExercises()]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-8 pb-16 sm:px-10 lg:pt-12 lg:pb-24">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Log</h1>
      <LogSwitcher weightUnit={weightUnit} exercises={exercises} />
    </section>
  );
}


