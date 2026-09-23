export const SummaryCardsSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2" aria-busy="true" aria-label="Loading summary" role="status">
    <div className="h-36 animate-pulse rounded-2xl bg-[#0d3b66]" />
    <div className="h-36 animate-pulse rounded-2xl bg-[#16385f]" />
  </div>
);

export const SectionSkeleton = () => (
  <div className="mt-5 h-72 animate-pulse rounded-2xl bg-[#16385f]" aria-busy="true" aria-label="Loading section" role="status" />
);

export const ChartSkeleton = () => (
  <div className="mt-5 h-96 animate-pulse rounded-2xl bg-[#16385f]" aria-busy="true" aria-label="Loading chart" role="status" />
);