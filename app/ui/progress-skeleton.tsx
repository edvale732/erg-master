export const ProgressSkeleton = () => (
  <div className="mt-14" aria-busy="true" aria-label="Loading progress" role="status">
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="h-36 animate-pulse rounded-2xl bg-[#0d3b66]" />
      <div className="h-36 animate-pulse rounded-2xl bg-[#16385f]" />
    </div>
    <div className="mt-5 h-72 animate-pulse rounded-2xl bg-[#16385f]" />
    <div className="mt-5 h-96 animate-pulse rounded-2xl bg-[#16385f]" />
  </div>
);