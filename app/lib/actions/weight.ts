'use server';

import { sql } from '@/app/lib/db';
import { getAuthenticatedUserId } from './auth';

export type WeightUnit = 'kg' | 'lb';

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
