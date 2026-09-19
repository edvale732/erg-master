import { notFound } from "next/navigation";
import { getStrengthSession } from "@/app/lib/actions/strength-sessions";
import { getExercises } from "@/app/lib/actions/exercises";
import { getWeightUnit } from "@/app/lib/actions/weight";
import StrengthLoggingForm from "@/app/ui/logging-form/strength-logging-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Session",
  description: "Edit your strength session details in ErgMaster"
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, exercises, weightUnit] = await Promise.all([
    getStrengthSession(id),
    getExercises(),
    getWeightUnit(),
  ]);

  if (!session) notFound();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Edit session</h1>
      <StrengthLoggingForm session={session} exercises={exercises} weightUnit={weightUnit} />
    </section>
  );
}
