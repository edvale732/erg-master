export type PredictionResponse = {
  prediction: string;
  predictedTimeSeconds?: number | null;
  predictedSplit?: string | null;
  predictedWatts?: number | null;
  sessionsUsed: number;
};

export async function getPredictions(sessions: unknown[]): Promise<PredictionResponse> {
  try {
    const response = await fetch("http://localhost:8000/predictions/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Prediction service failed: ${response.status}`);
    }

    return response.json();
  } catch {
    return {
      prediction: "Service offline",
      predictedTimeSeconds: null,
      predictedSplit: null,
      predictedWatts: null,
      sessionsUsed: 0,
    };
  }
}