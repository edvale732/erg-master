'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/app/lib/auth';


const sql = neon(`${process.env.DATABASE_URL}`);

const RowingSessionSchema = z.object({
  id: z.uuid(),
  userId: z.string({error: 'User is required'}).min(1, {error: 'User is required'}),
  sessionDate: z.string({error: 'Session date is required'}),
  notes: z.string().nullable(),
  createdAt: z.string({error: 'Creation date is required'})
});

const RowingIntervalSchema = z.object({
  intervalNumber: z.number().int().gt(0),
  distance: z.number().int().gt(0),
  timeSeconds: z.number().int().gt(0),
  avgStrokeRate: z.number().int().gt(0).nullish().transform((value) => value ?? null),
  avgWatts: z.number().int().gte(0).nullish().transform((value) => value ?? null),
  restTimeSeconds: z.number().int().gte(0).nullish().transform((value) => value ?? null),
});
 
const CreateRowingSession = RowingSessionSchema.omit({ id: true, createdAt: true });

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export type RowingSession = {
  id: string;
  sessionDate: string;
  notes: string | null;
  createdAt: string;
};

export type RowingInterval = {
  id: string;
  rowingSessionId: string;
  intervalNumber: number;
  distance: number;
  timeSeconds: number;
  avgStrokeRate: number | null;
  avgWatts: number | null;
  restTimeSeconds: number | null;
  createdAt: string;
}

export type RowingSessionWithIntervals = RowingSession & { intervals: RowingInterval[] };

export type PaginatedRowingSessions = {
  sessions: RowingSessionWithIntervals[];
  currentPage: number;
  totalPages: number;
};

const getFormValue = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : null;
};

const getOptionalTextFormValue = (formData: FormData, field: string) => {
  const value = getFormValue(formData, field);
  return value === null || value.trim() === '' ? null : value;
};

const getIntervalsFormValue = (formData: FormData) => {
  const value = getFormValue(formData, 'intervals');
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseRowingSessionForm = (formData: FormData, userId: string) => ({
  userId,
  sessionDate: getFormValue(formData, 'sessionDate'),
  notes: getOptionalTextFormValue(formData, 'notes'),
});

const getAuthenticatedUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
};

export async function getRowingSessions(): Promise<RowingSession[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  const rows = await sql`
    SELECT
      id,
      session_date::text AS "sessionDate",
      notes,
      created_at::text AS "createdAt"
    FROM rowing_sessions
    WHERE user_id = ${userId}
    ORDER BY session_date DESC, created_at DESC
  `;

  return rows as RowingSession[];
}

export async function getRowingSession(id: string): Promise<RowingSessionWithIntervals | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const rows = await sql`
    SELECT
      id,
      session_date::text AS "sessionDate",
      notes,
      created_at::text AS "createdAt"
    FROM rowing_sessions
    WHERE id = ${id} AND user_id = ${userId}
  `;

  const session = rows[0] as RowingSession | undefined;
  return session ? { ...session, intervals: await getRowingIntervals(session.id) } : null;
}

export async function getRowingIntervals(sessionId: string): Promise<RowingInterval[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  const rows = await sql`
    SELECT
      i.id,
      i.rowing_session_id AS "rowingSessionId",
      i.interval_number AS "intervalNumber",
      i.distance,
      i.time_seconds AS "timeSeconds",
      i.avg_stroke_rate AS "avgStrokeRate",
      i.avg_watts AS "avgWatts",
      i.rest_time_seconds AS "restTimeSeconds",
      i.created_at::text AS "createdAt"
    FROM rowing_intervals i
    INNER JOIN rowing_sessions s ON s.id = i.rowing_session_id
    WHERE i.rowing_session_id = ${sessionId} AND s.user_id = ${userId}
    ORDER BY i.interval_number ASC
  `;

  return rows as RowingInterval[];
}

export async function getRowingSessionsWithIntervals(): Promise<RowingSessionWithIntervals[]> {
  const sessions = await getRowingSessions();
  return Promise.all(sessions.map(async (session) => ({
    ...session,
    intervals: await getRowingIntervals(session.id),
  })));
}

export async function getPaginatedRowingSessions(page: number, pageSize = 10): Promise<PaginatedRowingSessions> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { sessions: [], currentPage: 1, totalPages: 0 };

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM rowing_sessions
    WHERE user_id = ${userId}
  `;
  const totalSessions = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.ceil(totalSessions / pageSize);
  const currentPage = totalPages === 0
    ? 1
    : Math.min(Math.max(Math.floor(page), 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = await sql`
    SELECT
      paged_sessions.id,
      paged_sessions.session_date::text AS "sessionDate",
      paged_sessions.notes,
      paged_sessions.created_at::text AS "createdAt",
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'rowingSessionId', i.rowing_session_id,
            'intervalNumber', i.interval_number,
            'distance', i.distance,
            'timeSeconds', i.time_seconds,
            'avgStrokeRate', i.avg_stroke_rate,
            'avgWatts', i.avg_watts,
            'restTimeSeconds', i.rest_time_seconds,
            'createdAt', i.created_at::text
          ) ORDER BY i.interval_number
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) AS intervals
    FROM (
      SELECT id, session_date, notes, created_at
      FROM rowing_sessions
      WHERE user_id = ${userId}
      ORDER BY session_date DESC, created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    ) AS paged_sessions
    LEFT JOIN rowing_intervals i ON i.rowing_session_id = paged_sessions.id
    GROUP BY paged_sessions.id, paged_sessions.session_date, paged_sessions.notes, paged_sessions.created_at
    ORDER BY paged_sessions.session_date DESC, paged_sessions.created_at DESC
  `;

  const sessions = rows as RowingSessionWithIntervals[];

  return { sessions, currentPage, totalPages };
}

export async function createRowingSession(_prevState: State, formData: FormData) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to create a rowing session.' };

  const validatedFields = CreateRowingSession.safeParse(
    parseRowingSessionForm(formData, userId),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create rowing session.',
    };
  }

  const {
    userId: validatedUserId,
    sessionDate,
    notes,
  } = validatedFields.data;

  const intervals = z.array(RowingIntervalSchema).safeParse(getIntervalsFormValue(formData));
  if (!intervals.success) return { message: 'Invalid interval data.' };

  try {
    const sessions = await sql`
      INSERT INTO rowing_sessions (
        user_id,
        session_date,
        notes
      )
      VALUES (
        ${validatedUserId},
        ${sessionDate},
        ${notes}
      )
      RETURNING id
    `;

    const sessionId = sessions[0].id;
    for (const interval of intervals.data) {
      await sql`
        INSERT INTO rowing_intervals (
          rowing_session_id, interval_number, distance, time_seconds,
          avg_stroke_rate, avg_watts, rest_time_seconds
        ) VALUES (
          ${sessionId}, ${interval.intervalNumber}, ${interval.distance}, ${interval.timeSeconds},
          ${interval.avgStrokeRate}, ${interval.avgWatts}, ${interval.restTimeSeconds}
        )
      `;
    }
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to create rowing session.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

const UpdateRowingSession = RowingSessionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export async function updateRowingSession(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to update a rowing session.' };

  const validatedFields = UpdateRowingSession.safeParse(
    parseRowingSessionForm(formData, userId),
  );
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update rowing session.',
    };
  }
 
  const {
    sessionDate,
    notes,
  } = validatedFields.data;

  const intervals = z.array(RowingIntervalSchema).safeParse(getIntervalsFormValue(formData));
  if (!intervals.success) return { message: 'Invalid interval data.' };
 
  try {
    await sql`
      UPDATE rowing_sessions
      SET
        session_date = ${sessionDate},
        notes = ${notes}
      WHERE id = ${id} AND user_id = ${userId}
    `;

    await sql`DELETE FROM rowing_intervals WHERE rowing_session_id = ${id}`;
    for (const interval of intervals.data) {
      await sql`
        INSERT INTO rowing_intervals (
          rowing_session_id, interval_number, distance, time_seconds,
          avg_stroke_rate, avg_watts, rest_time_seconds
        ) VALUES (
          ${id}, ${interval.intervalNumber}, ${interval.distance}, ${interval.timeSeconds},
          ${interval.avgStrokeRate}, ${interval.avgWatts}, ${interval.restTimeSeconds}
        )
      `;
    }
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to update rowing session.' };
  }
 
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/history');
  redirect('/dashboard/history');
}

export async function deleteRowingSession(id: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to delete a rowing session.' };

  try {
    await sql`
      DELETE FROM rowing_intervals
      WHERE rowing_session_id = ${id}
        AND EXISTS (
          SELECT 1 FROM rowing_sessions
          WHERE rowing_sessions.id = ${id} AND rowing_sessions.user_id = ${userId}
        )
    `;
    await sql`
      DELETE FROM rowing_sessions
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to delete rowing session.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/history');
  redirect('/dashboard/history');
}

export async function deleteRowingInterval(intervalId: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to delete an interval.' };

  try {
    await sql`
      DELETE FROM rowing_intervals
      WHERE id = ${intervalId}
        AND EXISTS (
          SELECT 1 FROM rowing_sessions
          WHERE rowing_sessions.id = rowing_intervals.rowing_session_id
            AND rowing_sessions.user_id = ${userId}
        )
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to delete rowing interval.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/history');
}