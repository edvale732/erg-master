'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import { getAuthenticatedUserId } from './auth';

const StrengthSessionFieldsSchema = z.object({
  sessionDate: z.string({ error: 'Session date is required' }),
  notes: z.string().nullable(),
});

const StrengthSetSchema = z.object({
  setNumber: z.number().int().gt(0),
  reps: z.number().int().gt(0),
  weightKg: z.number().gte(0),
  restTimeSeconds: z.number().int().gte(0).nullish().transform((value) => value ?? null),
  rpe: z.number().gte(0).lte(10).nullish().transform((value) => value ?? null),
});

const StrengthSessionExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseOrder: z.number().int().gt(0),
  sets: z.array(StrengthSetSchema).min(1, { error: 'Each exercise needs at least one set.' }),
});

const CreateStrengthSession = StrengthSessionFieldsSchema.extend({
  userId: z.string({ error: 'User is required' }).min(1, { error: 'User is required' }),
});

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export type StrengthSet = {
  id: string;
  strengthSessionExerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  restTimeSeconds: number | null;
  rpe: number | null;
  createdAt: string;
};

export type StrengthSessionExercise = {
  id: string;
  strengthSessionId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  exerciseOrder: number;
  createdAt: string;
  sets: StrengthSet[];
};

export type StrengthSession = {
  id: string;
  sessionDate: string;
  notes: string | null;
  createdAt: string;
};

export type StrengthSessionWithExercises = StrengthSession & { exercises: StrengthSessionExercise[] };

const getFormValue = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : null;
};

const getOptionalTextFormValue = (formData: FormData, field: string) => {
  const value = getFormValue(formData, field);
  return value === null || value.trim() === '' ? null : value;
};

const getExercisesFormValue = (formData: FormData) => {
  const value = getFormValue(formData, 'exercises');
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseStrengthSessionForm = (formData: FormData) => ({
  sessionDate: getFormValue(formData, 'sessionDate'),
  notes: getOptionalTextFormValue(formData, 'notes'),
});

const revalidateSessionPaths = () => {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/history');
};

const insertStrengthExercises = async (
  sessionId: string,
  exercises: z.infer<typeof StrengthSessionExerciseSchema>[],
) => {
  for (const exercise of exercises) {
    const [sessionExercise] = await sql`
      INSERT INTO strength_session_exercises (strength_session_id, exercise_id, exercise_order)
      VALUES (${sessionId}, ${exercise.exerciseId}, ${exercise.exerciseOrder})
      RETURNING id
    `;

    for (const set of exercise.sets) {
      await sql`
        INSERT INTO strength_sets (
          strength_session_exercise_id, set_number, reps, weight_kg, rest_time_seconds, rpe
        ) VALUES (
          ${sessionExercise.id}, ${set.setNumber}, ${set.reps}, ${set.weightKg},
          ${set.restTimeSeconds}, ${set.rpe}
        )
      `;
    }
  }
};

const getStrengthSessionsWithExercisesForUser = async (
  userId: string,
  options: { sessionId?: string; page?: number; pageSize?: number } = {},
): Promise<StrengthSessionWithExercises[]> => {
  const { sessionId, page, pageSize } = options;
  const offset = page !== undefined && pageSize !== undefined ? (page - 1) * pageSize : 0;
  const rows = await sql`
    WITH filtered_sessions AS (
      SELECT id, session_date, notes, created_at
      FROM strength_sessions
      WHERE user_id = ${userId}
        AND (${sessionId === undefined} OR id = ${sessionId ?? null})
      ORDER BY session_date DESC, created_at DESC
      LIMIT ${pageSize ?? null} OFFSET ${offset}
    )
    SELECT
      s.id,
      s.session_date::text AS "sessionDate",
      s.notes,
      s.created_at::text AS "createdAt",
      COALESCE(
        json_agg(
          json_build_object(
            'id', se.id,
            'strengthSessionId', se.strength_session_id,
            'exerciseId', se.exercise_id,
            'exerciseName', ex.name,
            'muscleGroup', ex.muscle_group,
            'exerciseOrder', se.exercise_order,
            'createdAt', se.created_at::text,
            'sets', (
              SELECT COALESCE(
                json_agg(
                  json_build_object(
                    'id', st.id,
                    'strengthSessionExerciseId', st.strength_session_exercise_id,
                    'setNumber', st.set_number,
                    'reps', st.reps,
                    'weightKg', st.weight_kg::float,
                    'restTimeSeconds', st.rest_time_seconds,
                    'rpe', st.rpe::float,
                    'createdAt', st.created_at::text
                  ) ORDER BY st.set_number
                ),
                '[]'::json
              )
              FROM strength_sets st
              WHERE st.strength_session_exercise_id = se.id
            )
          ) ORDER BY se.exercise_order
        ) FILTER (WHERE se.id IS NOT NULL),
        '[]'::json
      ) AS exercises
    FROM filtered_sessions s
    LEFT JOIN strength_session_exercises se ON se.strength_session_id = s.id
    LEFT JOIN exercises ex ON ex.id = se.exercise_id
    GROUP BY s.id, s.session_date, s.notes, s.created_at
    ORDER BY s.session_date DESC, s.created_at DESC
  `;

  return rows as StrengthSessionWithExercises[];
};

export async function getStrengthSession(id: string): Promise<StrengthSessionWithExercises | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const sessions = await getStrengthSessionsWithExercisesForUser(userId, { sessionId: id });
  return sessions[0] ?? null;
}

export async function getStrengthSessionsWithExercises(): Promise<StrengthSessionWithExercises[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  return getStrengthSessionsWithExercisesForUser(userId);
}

export async function createStrengthSession(_prevState: State, formData: FormData) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to create a strength session.' };

  const validatedFields = CreateStrengthSession.safeParse({
    ...parseStrengthSessionForm(formData),
    userId,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create strength session.',
    };
  }

  const { userId: validatedUserId, sessionDate, notes } = validatedFields.data;

  const exercises = z.array(StrengthSessionExerciseSchema).safeParse(getExercisesFormValue(formData));
  if (!exercises.success) return { message: 'Invalid exercise data.' };

  try {
    const sessions = await sql`
      INSERT INTO strength_sessions (user_id, session_date, notes)
      VALUES (${validatedUserId}, ${sessionDate}, ${notes})
      RETURNING id
    `;

    const sessionId = sessions[0].id;
    await insertStrengthExercises(sessionId, exercises.data);
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to create strength session.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateStrengthSession(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to update a strength session.' };

  const validatedFields = StrengthSessionFieldsSchema.safeParse(
    parseStrengthSessionForm(formData),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update strength session.',
    };
  }

  const { sessionDate, notes } = validatedFields.data;

  const exercises = z.array(StrengthSessionExerciseSchema).safeParse(getExercisesFormValue(formData));
  if (!exercises.success) return { message: 'Invalid exercise data.' };

  try {
    await sql`
      UPDATE strength_sessions
      SET session_date = ${sessionDate}, notes = ${notes}
      WHERE id = ${id} AND user_id = ${userId}
    `;

    await sql`DELETE FROM strength_session_exercises WHERE strength_session_id = ${id}`;
    await insertStrengthExercises(id, exercises.data);
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to update strength session.' };
  }

  revalidateSessionPaths();
  redirect('/dashboard/history');
}

export async function deleteStrengthSession(id: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to delete a strength session.' };

  try {
    await sql`
      DELETE FROM strength_sessions
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to delete strength session.' };
  }

  revalidateSessionPaths();
  redirect('/dashboard/history');
}

export async function deleteStrengthSessionExercise(exerciseEntryId: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to delete an exercise.' };

  try {
    await sql`
      DELETE FROM strength_session_exercises
      WHERE id = ${exerciseEntryId}
        AND EXISTS (
          SELECT 1 FROM strength_sessions
          WHERE strength_sessions.id = strength_session_exercises.strength_session_id
            AND strength_sessions.user_id = ${userId}
        )
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to delete exercise.' };
  }

  revalidateSessionPaths();
}
