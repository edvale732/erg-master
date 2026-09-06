export default function ProfileSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-6xl motion-safe:animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none px-6 py-16 sm:px-10 lg:py-24"
      aria-label="Loading profile"
      aria-busy="true"
      role="status"
    >
      <div className="flex flex-col gap-8 border-b border-[#c3d2c8] pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full">
          <div className="h-4 w-24 rounded bg-[#cf633f]/30" />
          <div className="mt-5 h-16 max-w-2xl rounded bg-[#173b35]/15 sm:h-20" />
          <div className="mt-8 h-8 max-w-xl rounded bg-[#5b6d66]/15" />
        </div>
        <div className="h-11 w-28 rounded-xl border border-[#173b35]/20 bg-[#173b35]/10" />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl bg-[#fffdf7] p-7 shadow-[0_16px_50px_rgba(23,59,53,0.08)]">
          <div className="h-4 w-20 rounded bg-[#cf633f]/30" />
          <div className="mt-3 h-8 w-48 rounded bg-[#173b35]/15" />
          <div className="mt-8 space-y-6">
            <div>
              <div className="h-4 w-14 rounded bg-[#5b6d66]/15" />
              <div className="mt-2 h-7 w-40 rounded bg-[#173b35]/15" />
            </div>
            <div>
              <div className="h-4 w-14 rounded bg-[#5b6d66]/15" />
              <div className="mt-2 h-7 w-56 rounded bg-[#173b35]/15" />
            </div>
            <div>
              <div className="h-4 w-24 rounded bg-[#5b6d66]/15" />
              <div className="mt-2 h-7 w-32 rounded bg-[#173b35]/15" />
            </div>
          </div>
        </div>

        <div>
          <div className="h-4 w-36 rounded bg-[#cf633f]/30" />
          <div className="mt-3 h-8 w-44 rounded bg-[#173b35]/15" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="h-44 rounded-2xl bg-[#173b35]/20 p-6" />
            <div className="h-44 rounded-2xl bg-[#cf633f]/25 p-6" />
            <div className="h-44 rounded-2xl bg-[#fffdf7] p-6 shadow-[0_16px_50px_rgba(23,59,53,0.08)]" />
            <div className="h-44 rounded-2xl bg-[#e1eadf] p-6" />
          </div>
        </div>
      </div>
    </section>
  );
}