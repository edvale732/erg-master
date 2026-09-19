import { getPaginatedSessionHistory } from "@/app/lib/actions/session-history";
import Pagination from "@/app/ui/pagination";
import SessionHistory from "@/app/ui/session-history";
import SessionHistorySkeleton from "@/app/ui/skeletons/session-history-skeleton";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description: "View your rowing session history in ErgMaster"
};

async function HistoryContent({ page }: { page: number }) {
  const { entries, currentPage, totalPages } = await getPaginatedSessionHistory(page, 5);

  return (
    <>
      <SessionHistory entries={entries} />
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
      <div className="mt-8">
        <Suspense fallback={<SessionHistorySkeleton />}>
          <HistoryContent page={page} />
        </Suspense>
      </div>
    </section>
  );
}
