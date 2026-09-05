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
  workoutType: z.string({error: 'Workout type is required'}).min(1).max(50),
  totalDistance: z.number({error: 'Total distance is required'}).int().gt(0),
  totalTimeSeconds: z.number({error: 'Total time is required'}).int().gt(0),
  targetPaceSeconds: z.number().int().gt(0).nullable(),
  avgStrokeRate: z.number().int().gt(0).nullable(),
  targetStrokeRate: z.number().int().gt(0).nullable(),
  avgWatts: z.number().int().gte(0).nullable(),
  dragFactor: z.number().int().gt(0).nullable(),
  notes: z.string().nullable(),
  createdAt: z.string({error: 'Creation date is required'})
});
 
const CreateRowingSession = RowingSessionSchema.omit({ id: true, createdAt: true });

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export type RowingSession = {
  id: string;
  sessionDate: string;
  workoutType: string;
  totalDistance: number;
  totalTimeSeconds: number;
  avgStrokeRate: number | null;
  avgWatts: number | null;
};

const getFormValue = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : null;
};

const getIntegerFormValue = (formData: FormData, field: string) => {
  const value = getFormValue(formData, field);
  if (value === null || value.trim() === '') return null;

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : value;
};

const getOptionalTextFormValue = (formData: FormData, field: string) => {
  const value = getFormValue(formData, field);
  return value === null || value.trim() === '' ? null : value;
};

const parseRowingSessionForm = (formData: FormData, userId: string) => ({
  userId,
  sessionDate: getFormValue(formData, 'sessionDate'),
  workoutType: getFormValue(formData, 'workoutType'),
  totalDistance: getIntegerFormValue(formData, 'totalDistance'),
  totalTimeSeconds: getIntegerFormValue(formData, 'totalTimeSeconds'),
  targetPaceSeconds: getIntegerFormValue(formData, 'targetPaceSeconds'),
  avgStrokeRate: getIntegerFormValue(formData, 'avgStrokeRate'),
  targetStrokeRate: getIntegerFormValue(formData, 'targetStrokeRate'),
  avgWatts: getIntegerFormValue(formData, 'avgWatts'),
  dragFactor: getIntegerFormValue(formData, 'dragFactor'),
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
      workout_type AS "workoutType",
      total_distance AS "totalDistance",
      total_time_seconds AS "totalTimeSeconds",
      avg_stroke_rate AS "avgStrokeRate",
      avg_watts AS "avgWatts"
    FROM rowing_sessions
    WHERE user_id = ${userId}
    ORDER BY session_date DESC, created_at DESC
  `;

  return rows as RowingSession[];
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
    workoutType,
    totalDistance,
    totalTimeSeconds,
    targetPaceSeconds,
    avgStrokeRate,
    targetStrokeRate,
    avgWatts,
    dragFactor,
    notes,
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO rowing_sessions (
        user_id,
        session_date,
        workout_type,
        total_distance,
        total_time_seconds,
        target_pace_seconds,
        avg_stroke_rate,
        target_stroke_rate,
        avg_watts,
        drag_factor,
        notes
      )
      VALUES (
        ${validatedUserId},
        ${sessionDate},
        ${workoutType},
        ${totalDistance},
        ${totalTimeSeconds},
        ${targetPaceSeconds},
        ${avgStrokeRate},
        ${targetStrokeRate},
        ${avgWatts},
        ${dragFactor},
        ${notes}
      )
    `;
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
    workoutType,
    totalDistance,
    totalTimeSeconds,
    targetPaceSeconds,
    avgStrokeRate,
    targetStrokeRate,
    avgWatts,
    dragFactor,
    notes,
  } = validatedFields.data;
 
  try {
    await sql`
      UPDATE rowing_sessions
      SET
        session_date = ${sessionDate},
        workout_type = ${workoutType},
        total_distance = ${totalDistance},
        total_time_seconds = ${totalTimeSeconds},
        target_pace_seconds = ${targetPaceSeconds},
        avg_stroke_rate = ${avgStrokeRate},
        target_stroke_rate = ${targetStrokeRate},
        avg_watts = ${avgWatts},
        drag_factor = ${dragFactor},
        notes = ${notes}
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to update rowing session.' };
  }
 
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function deleteRowingSession(id: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to delete a rowing session.' };

  try {
    await sql`
      DELETE FROM rowing_sessions
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to delete rowing session.' };
  }

  revalidatePath('/dashboard');
}