import { cache } from "react";
import { getRowingSessionsWithIntervals } from "@/app/lib/actions/rowing-sessions";
import { getWeightEntries, getWeightUnit } from "@/app/lib/actions/weight";
import { getPredictions } from "@/app/lib/fastapi";

// Dedupes repeated calls within a single request so each progress section can fetch independently.
export const getSessions = cache(getRowingSessionsWithIntervals);

export const getSessionPredictions = cache(async () => getPredictions(await getSessions()));

export const getWeightData = cache(async () => ({
  entries: await getWeightEntries(),
  unit: await getWeightUnit(),
}));
