import LoggingForm from "@/app/ui/logging-form";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#69b3ff]">Log</p>
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Capture your next session.</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#a9bfd7]">Record the details while they are still fresh.</p>
      <LoggingForm />
    </section>
  );
}
