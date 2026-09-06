export default function DashboardHomeSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24"
      aria-label="Loading dashboard"
      aria-busy="true"
      role="status"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-16">
        <div className="flex flex-col">
          <div className="h-4 w-28 animate-pulse rounded bg-[#69b3ff]/30" />
          <div className="mt-5 h-20 max-w-2xl animate-pulse rounded bg-[#f7fbff]/15 sm:h-28" />
          <div className="mt-8 h-16 max-w-xl animate-pulse rounded bg-[#a9bfd7]/15" />
          <div className="mt-12 flex gap-4 lg:mt-auto lg:pt-12">
            <div className="h-12 w-32 animate-pulse rounded-xl bg-[#2f80ed]/60" />
            <div className="h-12 w-36 animate-pulse rounded-xl border border-[#69b3ff]/30 bg-[#f7fbff]/10" />
          </div>
        </div>

        <div className="grid gap-5">
          <div className="h-36 animate-pulse rounded-2xl bg-[#0d3b66]" />
          <div className="h-72 animate-pulse rounded-2xl bg-[#f7fbff]/80" />
        </div>
      </div>
    </section>
  );
}