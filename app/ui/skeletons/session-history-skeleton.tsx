export default function SessionHistorySkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="Loading session history"
      aria-busy="true"
      role="status"
    >
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          className="flex animate-pulse flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[#f7fbff]/80 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:flex-nowrap sm:p-5"
          key={item}
        >
          <div className="shrink-0 sm:w-[12.5rem]">
            <div className="h-3 w-24 rounded bg-[#69b3ff]/30" />
            <div className="mt-3 h-6 w-32 rounded bg-[#071a33]/15" />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3">
            <div className="h-4 flex-1 rounded bg-[#36584f]/15" />
            <div className="h-4 flex-1 rounded bg-[#36584f]/15" />
            <div className="h-4 flex-1 rounded bg-[#36584f]/15" />
            <div className="h-4 flex-1 rounded bg-[#36584f]/15" />
          </div>
          <div className="ml-auto h-10 w-10 shrink-0 rounded-full bg-[#1f6fd1]/15" />
        </div>
      ))}
    </div>
  );
}