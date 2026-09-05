import { getRowingSessions } from "@/app/lib/actions";
import SessionHistory from "@/app/ui/session-history";

export default async function Page() {
  const sessions = await getRowingSessions();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">History</p>
      <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Review the work you have done.</h1>
      <p className="mt-8 max-w-xl text-xl leading-8 text-[#5b6d66]">Your completed rowing sessions will be listed here.</p>
      <SessionHistory sessions={sessions} />
    </section>
  );
}
