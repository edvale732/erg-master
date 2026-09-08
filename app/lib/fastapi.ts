export async function getPredictions(sessions: unknown[]) {
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
}