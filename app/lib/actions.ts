'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/app/lib/auth';

const sql = neon(`${process.env.DATABASE_URL}`);

const SessionTypeSchema = z.enum([
  'single_distance',
  'single_time',
  'timed_intervals',
  'distance_intervals',
]);

const LogModeSchema = z.enum([
  'single-distance',
  'single-time',
  'timed-intervals',
  'distance-intervals',
]);

const logModeToSessionType = {
  'single-distance': 'single_distance',
  'single-time': 'single_time',
  'timed-intervals': 'timed_intervals',
  'distance-intervals': 'distance_intervals',
} as const;

const RowingSessionFieldsSchema = z.object({
  sessionDate: z.string({error: 'Session date is required'}),
  sessionType: SessionTypeSchema,
  notes: z.string().nullable(),
});

const RowingIntervalSchema = z.object({
  intervalNumber: z.number().int().gt(0),
  distance: z.number().int().gt(0),
  timeSeconds: z.number().int().gt(0),
  avgStrokeRate: z.number().int().gt(0).nullish().transform((value) => value ?? null),
  avgWatts: z.number().int().gte(0).nullish().transform((value) => value ?? null),
  restTimeSeconds: z.number().int().gte(0).nullish().transform((value) => value ?? null),
});
 
const CreateRowingSession = RowingSessionFieldsSchema.extend({
  userId: z.string({error: 'User is required'}).min(1, {error: 'User is required'}),
});

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export type RowingSession = {
  id: string;
  sessionDate: string;
  sessionType: z.infer<typeof SessionTypeSchema>;
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

const parseRowingSessionForm = (formData: FormData) => ({
  sessionDate: getFormValue(formData, 'sessionDate'),
  sessionType: (() => {
    const logMode = getFormValue(formData, 'logMode');
    if (!logMode || !LogModeSchema.safeParse(logMode).success) return null;
    return logModeToSessionType[logMode as keyof typeof logModeToSessionType];
  })(),
  notes: getOptionalTextFormValue(formData, 'notes'),
});

const getAuthenticatedUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
};

const revalidateSessionPaths = () => {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/history');
};

const insertRowingIntervals = async (sessionId: string, intervals: z.infer<typeof RowingIntervalSchema>[]) => {
  for (const interval of intervals) {
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
};

const getRowingSessionsWithIntervalsForUser = async (
  userId: string,
  options: { sessionId?: string; page?: number; pageSize?: number } = {},
): Promise<RowingSessionWithIntervals[]> => {
  const { sessionId, page, pageSize } = options;
  const offset = page !== undefined && pageSize !== undefined ? (page - 1) * pageSize : 0;
  const rows = await sql`
    WITH filtered_sessions AS (
      SELECT id, session_date, session_type, notes, created_at
      FROM rowing_sessions
      WHERE user_id = ${userId}
        AND (${sessionId === undefined} OR id = ${sessionId ?? null})
      ORDER BY session_date DESC, created_at DESC
      LIMIT ${pageSize ?? null} OFFSET ${offset}
    )
    SELECT
      s.id,
      s.session_date::text AS "sessionDate",
      s.session_type AS "sessionType",
      s.notes,
      s.created_at::text AS "createdAt",
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
    FROM filtered_sessions s
    LEFT JOIN rowing_intervals i ON i.rowing_session_id = s.id
    GROUP BY s.id, s.session_date, s.session_type, s.notes, s.created_at
    ORDER BY s.session_date DESC, s.created_at DESC
  `;

  return rows as RowingSessionWithIntervals[];
};

export async function getRowingSession(id: string): Promise<RowingSessionWithIntervals | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const sessions = await getRowingSessionsWithIntervalsForUser(userId, { sessionId: id });
  return sessions[0] ?? null;
}

export async function getRowingSessionsWithIntervals(): Promise<RowingSessionWithIntervals[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  return getRowingSessionsWithIntervalsForUser(userId);
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
  const sessions = await getRowingSessionsWithIntervalsForUser(userId, { page: currentPage, pageSize });

  return { sessions, currentPage, totalPages };
}

export async function createRowingSession(_prevState: State, formData: FormData) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to create a rowing session.' };

  const validatedFields = CreateRowingSession.safeParse({
    ...parseRowingSessionForm(formData),
    userId,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create rowing session.',
    };
  }

  const {
    userId: validatedUserId,
    sessionDate,
    sessionType,
    notes,
  } = validatedFields.data;

  const intervals = z.array(RowingIntervalSchema).safeParse(getIntervalsFormValue(formData));
  if (!intervals.success) return { message: 'Invalid interval data.' };

  try {
    const sessions = await sql`
      INSERT INTO rowing_sessions (
        user_id,
        session_date,
        session_type,
        notes
      )
      VALUES (
        ${validatedUserId},
        ${sessionDate},
        ${sessionType},
        ${notes}
      )
      RETURNING id
    `;

    const sessionId = sessions[0].id;
    await insertRowingIntervals(sessionId, intervals.data);
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to create rowing session.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateRowingSession(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to update a rowing session.' };

  const validatedFields = RowingSessionFieldsSchema.safeParse(
    parseRowingSessionForm(formData),
  );
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update rowing session.',
    };
  }
 
  const {
    sessionDate,
    sessionType,
    notes,
  } = validatedFields.data;

  const intervals = z.array(RowingIntervalSchema).safeParse(getIntervalsFormValue(formData));
  if (!intervals.success) return { message: 'Invalid interval data.' };
 
  try {
    await sql`
      UPDATE rowing_sessions
      SET
        session_date = ${sessionDate},
        session_type = ${sessionType},
        notes = ${notes}
      WHERE id = ${id} AND user_id = ${userId}
    `;

    await sql`DELETE FROM rowing_intervals WHERE rowing_session_id = ${id}`;
    await insertRowingIntervals(id, intervals.data);
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to update rowing session.' };
  }
 
  revalidateSessionPaths();
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

  revalidateSessionPaths();
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

  revalidateSessionPaths();
}