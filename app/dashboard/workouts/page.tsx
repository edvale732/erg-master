import Link from "next/link";
import { getStrengthTemplates } from "@/app/lib/actions/strength-templates";
import TemplateList from "@/app/ui/workouts/template-list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workouts",
  description: "View your saved workouts and training plans in ErgMaster"
};

export default async function Page() {
  const templates = await getStrengthTemplates();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Templates</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">Save strength templates and start a session from them any time.</p>
      <Link
        href="/dashboard/workouts/new"
        className="mt-8 inline-flex rounded-xl bg-[#2f80ed] px-6 py-3.5 font-semibold text-white transition hover:bg-[#1f6fd1]"
      >
        New template
      </Link>
      <TemplateList templates={templates} />
    </section>
  );
}

