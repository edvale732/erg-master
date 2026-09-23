'use server';

import { z } from 'zod';
import { sql } from '@/app/lib/db';
import { getAuthenticatedUserId } from './auth';

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
};

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export async function getExercises(): Promise<Exercise[]> {
  const userId = await getAuthenticatedUserId();

  const rows = await sql`
    SELECT id, name, muscle_group AS "muscleGroup"
    FROM exercises
    WHERE user_id IS NULL OR user_id = ${userId}
    ORDER BY muscle_group, name
  `;

  return rows as Exercise[];
}

const CreateExerciseSchema = z.object({
  userId: z.string({ error: 'User is required' }).min(1, { error: 'User is required' }),
  name: z.string({ error: 'Exercise name is required' }).min(1, { error: 'Exercise name is required' }),
  muscleGroup: z.string({ error: 'Muscle group is required' }).min(1, { error: 'Muscle group is required' }),
});

export async function createCustomExercise(_prevState: State, formData: FormData): Promise<State> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to add an exercise.' };

  const validatedFields = CreateExerciseSchema.safeParse({
    userId,
    name: formData.get('name'),
    muscleGroup: formData.get('muscleGroup'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to add exercise.',
    };
  }

  const { name, muscleGroup } = validatedFields.data;

  try {
    await sql`
      INSERT INTO exercises (name, muscle_group, user_id)
      VALUES (${name}, ${muscleGroup}, ${userId})
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to add exercise.' };
  }

  return { message: 'Exercise added.' };
}
