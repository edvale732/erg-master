'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import { getAuthenticatedUserId } from './auth';

const TemplateExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseOrder: z.number().int().gt(0),
  targetSets: z.number().int().gt(0),
});

const CreateStrengthTemplate = z.object({
  userId: z.string({ error: 'User is required' }).min(1, { error: 'User is required' }),
  name: z.string({ error: 'Template name is required' }).min(1, { error: 'Template name is required' }),
});

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export type StrengthTemplateExercise = {
  id: string;
  strengthTemplateId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  exerciseOrder: number;
  targetSets: number;
};

export type StrengthTemplate = {
  id: string;
  name: string;
  createdAt: string;
};

export type StrengthTemplateWithExercises = StrengthTemplate & { exercises: StrengthTemplateExercise[] };

const getFormValue = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : null;
};

const getTemplateExercisesFormValue = (formData: FormData) => {
  const value = getFormValue(formData, 'exercises');
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const insertTemplateExercises = async (
  templateId: string,
  exercises: z.infer<typeof TemplateExerciseSchema>[],
) => {
  for (const exercise of exercises) {
    await sql`
      INSERT INTO strength_template_exercises (strength_template_id, exercise_id, exercise_order, target_sets)
      VALUES (${templateId}, ${exercise.exerciseId}, ${exercise.exerciseOrder}, ${exercise.targetSets})
    `;
  }
};

const getStrengthTemplatesForUser = async (
  userId: string,
  templateId?: string,
): Promise<StrengthTemplateWithExercises[]> => {
  const rows = await sql`
    WITH filtered_templates AS (
      SELECT id, name, created_at
      FROM strength_templates
      WHERE user_id = ${userId}
        AND (${templateId === undefined} OR id = ${templateId ?? null})
      ORDER BY created_at DESC
    )
    SELECT
      t.id,
      t.name,
      t.created_at::text AS "createdAt",
      COALESCE(
        json_agg(
          json_build_object(
            'id', te.id,
            'strengthTemplateId', te.strength_template_id,
            'exerciseId', te.exercise_id,
            'exerciseName', ex.name,
            'muscleGroup', ex.muscle_group,
            'exerciseOrder', te.exercise_order,
            'targetSets', te.target_sets
          ) ORDER BY te.exercise_order
        ) FILTER (WHERE te.id IS NOT NULL),
        '[]'::json
      ) AS exercises
    FROM filtered_templates t
    LEFT JOIN strength_template_exercises te ON te.strength_template_id = t.id
    LEFT JOIN exercises ex ON ex.id = te.exercise_id
    GROUP BY t.id, t.name, t.created_at
    ORDER BY t.created_at DESC
  `;

  return rows as StrengthTemplateWithExercises[];
};

export async function getStrengthTemplates(): Promise<StrengthTemplateWithExercises[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  return getStrengthTemplatesForUser(userId);
}

export async function getStrengthTemplate(id: string): Promise<StrengthTemplateWithExercises | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const templates = await getStrengthTemplatesForUser(userId, id);
  return templates[0] ?? null;
}

export async function createStrengthTemplate(_prevState: State, formData: FormData) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to create a template.' };

  const validatedFields = CreateStrengthTemplate.safeParse({
    userId,
    name: getFormValue(formData, 'name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create template.',
    };
  }

  const exercises = z.array(TemplateExerciseSchema).safeParse(getTemplateExercisesFormValue(formData));
  if (!exercises.success) return { message: 'Invalid exercise data.' };

  const { userId: validatedUserId, name } = validatedFields.data;

  try {
    const templates = await sql`
      INSERT INTO strength_templates (user_id, name)
      VALUES (${validatedUserId}, ${name})
      RETURNING id
    `;

    await insertTemplateExercises(templates[0].id, exercises.data);
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to create template.' };
  }

  revalidatePath('/dashboard/workouts');
  redirect('/dashboard/workouts');
}

export async function updateStrengthTemplate(id: string, _prevState: State, formData: FormData) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to update a template.' };

  const name = getFormValue(formData, 'name');
  if (!name) {
    return {
      errors: { name: ['Template name is required'] },
      message: 'Missing fields. Failed to update template.',
    };
  }

  const exercises = z.array(TemplateExerciseSchema).safeParse(getTemplateExercisesFormValue(formData));
  if (!exercises.success) return { message: 'Invalid exercise data.' };

  try {
    await sql`
      UPDATE strength_templates
      SET name = ${name}
      WHERE id = ${id} AND user_id = ${userId}
    `;

    await sql`DELETE FROM strength_template_exercises WHERE strength_template_id = ${id}`;
    await insertTemplateExercises(id, exercises.data);
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to update template.' };
  }

  revalidatePath('/dashboard/workouts');
  redirect('/dashboard/workouts');
}

export async function deleteStrengthTemplate(id: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to delete a template.' };

  try {
    await sql`
      DELETE FROM strength_templates
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to delete template.' };
  }

  revalidatePath('/dashboard/workouts');
  redirect('/dashboard/workouts');
}
