export default function ProfileSkeleton() {
  return (
    <section
      className="mt-12 grid gap-8 motion-safe:animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
      aria-label="Loading profile"
      aria-busy="true"
      role="status"
    >
        <div className="rounded-2xl bg-[#f7fbff] p-7 shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
          <div className="h-4 w-20 rounded bg-[#69b3ff]/30" />
          <div className="mt-3 h-8 w-48 rounded bg-[#071a33]/15" />
          <div className="mt-8 space-y-6">
            <div>
              <div className="h-4 w-14 rounded bg-[#55708f]/15" />
              <div className="mt-2 h-7 w-40 rounded bg-[#071a33]/15" />
            </div>
            <div>
              <div className="h-4 w-14 rounded bg-[#55708f]/15" />
              <div className="mt-2 h-7 w-56 rounded bg-[#071a33]/15" />
            </div>
            <div>
              <div className="h-4 w-24 rounded bg-[#55708f]/15" />
              <div className="mt-2 h-7 w-32 rounded bg-[#071a33]/15" />
            </div>
          </div>
        </div>

        <div>
          <div className="h-4 w-36 rounded bg-[#69b3ff]/30" />
          <div className="mt-3 h-8 w-44 rounded bg-[#f7fbff]/15" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="h-44 rounded-2xl bg-[#0d3b66]/70 p-6" />
            <div className="h-44 rounded-2xl bg-[#2f80ed]/70 p-6" />
            <div className="h-44 rounded-2xl bg-[#f7fbff] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.2)]" />
            <div className="h-44 rounded-2xl bg-[#dceeff] p-6" />
          </div>
        </div>
    </section>
  );
}