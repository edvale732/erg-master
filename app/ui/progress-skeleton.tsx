export const ProgressSkeleton = () => (
  <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24" aria-busy="true" aria-label="Loading progress">
    <div className="h-5 w-28 animate-pulse rounded bg-[#2d4e73]" />
    <div className="mt-5 h-20 max-w-2xl animate-pulse rounded bg-[#16385f]" />
    <div className="mt-8 h-8 max-w-xl animate-pulse rounded bg-[#16385f]" />
    <div className="mt-14 grid gap-5 sm:grid-cols-2">
      <div className="h-36 animate-pulse rounded-2xl bg-[#0d3b66]" />
      <div className="h-36 animate-pulse rounded-2xl bg-[#16385f]" />
    </div>
    <div className="mt-5 h-72 animate-pulse rounded-2xl bg-[#16385f]" />
    <div className="mt-5 h-96 animate-pulse rounded-2xl bg-[#16385f]" />
  </section>
);