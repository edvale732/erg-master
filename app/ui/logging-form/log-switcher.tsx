"use client";

import { useState } from "react";
import LoggingForm from "@/app/ui/logging-form/logging-form";
import StrengthLoggingForm from "@/app/ui/logging-form/strength-logging-form";
import WeightForm from "@/app/ui/logging-form/weight-form";
import type { Exercise } from "@/app/lib/actions/exercises";
import type { StrengthTemplateWithExercises } from "@/app/lib/actions/strength-templates";
import type { WeightUnit } from "@/app/lib/actions/weight";

type LogTab = "rowing" | "strength" | "weight";

const logOptions: { label: string; tab: LogTab }[] = [
  { label: "Log rowing", tab: "rowing" },
  { label: "Log strength", tab: "strength" },
  { label: "Log weight", tab: "weight" },
];

export default function LogSwitcher({
  weightUnit,
  exercises,
  templates = [],
  initialTemplateId,
  initialTab = "rowing",
}: {
  weightUnit: WeightUnit;
  exercises: Exercise[];
  templates?: StrengthTemplateWithExercises[];
  initialTemplateId?: string;
  initialTab?: LogTab;
}) {
  const [activeTab, setActiveTab] = useState<LogTab>(initialTab);


  return (
    <>
      <div className="mx-auto mt-8 w-full max-w-3xl">
        <div className="flex flex-wrap justify-start gap-3">
          {logOptions.map(({ label, tab }) => (
            <button
              key={tab}
              type="button"
              aria-current={activeTab === tab ? "page" : undefined}
              onClick={() => setActiveTab(tab)}
              className={[
                "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === tab
                  ? "border-[#2f80ed] bg-[#2f80ed] text-white shadow-[0_8px_20px_rgba(47,128,237,0.25)]"
                  : "border-[#c8dced] bg-white text-[#294a6d] hover:border-[#2f80ed] hover:text-[#1f6fd1]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "rowing" && (
        <div className="mt-8">
          <LoggingForm />
        </div>
      )}

      {activeTab === "strength" && (
        <div className="mt-8">
          <StrengthLoggingForm exercises={exercises} weightUnit={weightUnit} templates={templates} initialTemplateId={initialTemplateId} />
        </div>
      )}

      {activeTab === "weight" && (
        <div className="mt-8">
          <WeightForm unit={weightUnit} />
        </div>
      )}
    </>
  );
}

