import { getPaginatedRowingSessions } from "@/app/lib/actions";
import Pagination from "@/app/ui/pagination";
import SessionHistory from "@/app/ui/session-history";
import SessionHistorySkeleton from "@/app/ui/session-history-skeleton";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description: "View your rowing session history in ErgMaster"
};

async function HistoryContent({ page }: { page: number }) {
  const { sessions, currentPage, totalPages } = await getPaginatedRowingSessions(page, 5);

  return (
    <>
      <SessionHistory sessions={sessions} />
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number((await searchParams).page ?? '1');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">History</h1>
      <div className="mt-8 hidden items-center gap-x-8 px-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#a9bfd7] sm:flex">
        <div className="shrink-0 sm:w-[12.5rem]">Workout</div>
        <div className="flex min-w-0 flex-1 gap-x-6">
          <span className="flex-1">Distance</span>
          <span className="flex-1">Time</span>
          <span className="flex-1">Pace / 500 m</span>
          <span className="flex-1">Intervals</span>
        </div>
        <div className="h-10 w-10 shrink-0" />
      </div>
      <Suspense fallback={<SessionHistorySkeleton />}>
        <HistoryContent page={page} />
      </Suspense>
    </section>
  );
}
