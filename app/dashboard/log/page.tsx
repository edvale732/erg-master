import LoggingForm from "@/app/ui/logging-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log",
  description: "Log your activities in ErgMaster"
};

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-8 pb-16 sm:px-10 lg:pt-12 lg:pb-24">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Log</h1>
      <LoggingForm />
    </section>
  );
}
