import type { PredictionResponse } from "@/app/lib/fastapi";
import { formatTimeSeconds } from "./helpers";

export function PredictionSection({ predictions }: { predictions: PredictionResponse }) {
  return (
    <section className="mt-5 rounded-2xl bg-[#e4f1fc] p-6 text-[#071a33] sm:p-8" aria-labelledby="predictions-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold" id="predictions-heading">2K Performance Prediction</p>
          <p className="mt-1 text-sm text-[#55708f]">Machine learning forecast based on your training history.</p>
        </div>
        {predictions?.sessionsUsed !== undefined && predictions.sessionsUsed > 0 && (
          <p className="text-sm font-semibold text-[#1f6fd1]">
            Based on {predictions.sessionsUsed} {predictions.sessionsUsed === 1 ? "session" : "sessions"}
          </p>
        )}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl bg-[#0d3b66] p-5 text-[#f7fbff]">
          <p className="text-sm text-[#b5d3ef]">Predicted 2K Time</p>
          <p className="mt-4 text-3xl font-semibold sm:text-4xl">
            {predictions?.predictedTimeSeconds
              ? formatTimeSeconds(predictions.predictedTimeSeconds)
              : predictions?.prediction || "No data"}
          </p>
          <p className="mt-2 text-sm text-[#dceeff]">Estimated all-out 2,000m test time.</p>
        </div>
        <div className="rounded-xl bg-[#f7fbff] p-5 shadow-[0_10px_30px_rgba(20,75,120,0.12)]">
          <p className="text-sm text-[#55708f]">Target Split</p>
          <p className="mt-4 text-3xl font-semibold text-[#071a33] sm:text-4xl">
            {predictions?.predictedSplit ? `${predictions.predictedSplit}/500m` : "—"}
          </p>
          <p className="mt-2 text-sm text-[#55708f]">Average pace per 500 meters.</p>
        </div>
        <div className="rounded-xl bg-[#f7fbff] p-5 shadow-[0_10px_30px_rgba(20,75,120,0.12)]">
          <p className="text-sm text-[#55708f]">Estimated Power</p>
          <p className="mt-4 text-3xl font-semibold text-[#071a33] sm:text-4xl">
            {predictions?.predictedWatts ? `${Math.round(predictions.predictedWatts)} W` : "—"}
          </p>
          <p className="mt-2 text-sm text-[#55708f]">Target average wattage output.</p>
        </div>
      </div>
    </section>
  );
}
