export default function DashboardHomeSkeleton() {
  return (
    <div
      className="grid gap-5 text-left"
      aria-label="Loading dashboard"
      aria-busy="true"
      role="status"
    >
      <div className="h-36 animate-pulse rounded-2xl bg-[#0d3b66]" />
      <div className="h-72 animate-pulse rounded-2xl bg-[#f7fbff]/80" />
    </div>
  );
}