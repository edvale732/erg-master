import { getPaginatedRowingSessions } from "@/app/lib/actions";
import Pagination from "@/app/ui/pagination";
import SessionHistory from "@/app/ui/session-history";
import { Suspense } from 'react';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description: "View your rowing session history in ErgMaster"
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number((await searchParams).page ?? '1');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { sessions, currentPage, totalPages } = await getPaginatedRowingSessions(page, 5);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">History</h1>
      <Suspense fallback={<p>Loading sessions...</p>}>
        <SessionHistory sessions={sessions} />
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        )}
      </Suspense>
    </section>
  );
}
