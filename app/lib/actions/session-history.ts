import { sql } from '@/app/lib/db';
import { getAuthenticatedUserId } from './auth';
import { getRowingSession, type RowingSessionWithIntervals } from './rowing-sessions';
import { getStrengthSession, type StrengthSessionWithExercises } from './strength-sessions';

export type SessionHistoryEntry =
  | { kind: 'rowing'; session: RowingSessionWithIntervals }
  | { kind: 'strength'; session: StrengthSessionWithExercises };

export type PaginatedSessionHistory = {
  entries: SessionHistoryEntry[];
  currentPage: number;
  totalPages: number;
};

export async function getPaginatedSessionHistory(page: number, pageSize = 10): Promise<PaginatedSessionHistory> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { entries: [], currentPage: 1, totalPages: 0 };

  const countRows = await sql`
    SELECT (
      (SELECT COUNT(*) FROM rowing_sessions WHERE user_id = ${userId}) +
      (SELECT COUNT(*) FROM strength_sessions WHERE user_id = ${userId})
    )::int AS count
  `;
  const totalSessions = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.ceil(totalSessions / pageSize);
  const currentPage = totalPages === 0
    ? 1
    : Math.min(Math.max(Math.floor(page), 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = await sql`
    SELECT id, 'rowing' AS kind, session_date, created_at
    FROM rowing_sessions
    WHERE user_id = ${userId}
    UNION ALL
    SELECT id, 'strength' AS kind, session_date, created_at
    FROM strength_sessions
    WHERE user_id = ${userId}
    ORDER BY session_date DESC, created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const entries = await Promise.all((rows as { id: string; kind: 'rowing' | 'strength' }[]).map(async (row) => {
    if (row.kind === 'rowing') {
      const session = await getRowingSession(row.id);
      return session ? ({ kind: 'rowing', session } as const) : null;
    }

    const session = await getStrengthSession(row.id);
    return session ? ({ kind: 'strength', session } as const) : null;
  }));

  return {
    entries: entries.filter((entry): entry is SessionHistoryEntry => entry !== null),
    currentPage,
    totalPages,
  };
}
