'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { sql } from '@/app/lib/db';
import { getAuthenticatedUserId } from './auth';

const KG_TO_LB = 2.20462;

export type WeightUnit = 'kg' | 'lb';

export type State = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
};

export type WeightEntry = {
  id: string;
  weightKg: number;
  recordedAt: string;
  notes: string | null;
  createdAt: string;
};

export async function getWeightUnit(): Promise<WeightUnit> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return 'kg';

  const rows = await sql`
    SELECT weight_unit AS "weightUnit"
    FROM user_settings
    WHERE user_id = ${userId}
  `;

  return (rows[0]?.weightUnit as WeightUnit) ?? 'kg';
}

export async function getWeightEntries(limit = 12): Promise<WeightEntry[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  const rows = await sql`
    SELECT
      id,
      weight_kg::float AS "weightKg",
      recorded_at::text AS "recordedAt",
      notes,
      created_at::text AS "createdAt"
    FROM weight_entries
    WHERE user_id = ${userId}
    ORDER BY recorded_at DESC
    LIMIT ${limit}
  `;

  return (rows as WeightEntry[]).reverse();
}

const CreateWeightEntry = z.object({
  userId: z.string({ error: 'User is required' }).min(1, { error: 'User is required' }),
  weightKg: z.number({ error: 'Weight is required' }).positive({ error: 'Weight must be greater than 0' }),
  recordedAt: z.string({ error: 'Date is required' }).min(1, { error: 'Date is required' }),
  notes: z.string().nullable(),
});

export async function createWeightEntry(_prevState: State, formData: FormData): Promise<State> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { message: 'You must be signed in to log weight.' };

  const unit = await getWeightUnit();
  const rawWeight = formData.get('weight');
  const weight = rawWeight ? Number(rawWeight) : NaN;
  const weightKg = Number.isFinite(weight) ? (unit === 'lb' ? weight / KG_TO_LB : weight) : NaN;

  const validatedFields = CreateWeightEntry.safeParse({
    userId,
    weightKg,
    recordedAt: formData.get('recordedAt'),
    notes: (formData.get('notes') as string) || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to log weight.',
    };
  }

  const { weightKg: validatedWeightKg, recordedAt, notes } = validatedFields.data;

  try {
    await sql`
      INSERT INTO weight_entries (user_id, weight_kg, recorded_at, notes)
      VALUES (${userId}, ${validatedWeightKg}, ${recordedAt}, ${notes})
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database error: Failed to log weight.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/progress');

  return { message: 'Weight logged.' };
}
