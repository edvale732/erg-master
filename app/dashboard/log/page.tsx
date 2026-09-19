import LoggingForm from "@/app/ui/logging-form/logging-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log",
  description: "Log your activities in ErgMaster"
};

export default function Page() {
  const logOptions = [
    { label: "Log rowing", href: "#log-rowing", active: true },
    { label: "Log strength", href: "#log-strength" },
    { label: "Log weight", href: "#log-weight" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-8 pb-16 sm:px-10 lg:pt-12 lg:pb-24">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Log</h1>

      <div className="mt-8 w-full max-w-[48rem]">
        <div className="flex flex-wrap justify-start gap-3">
          {logOptions.map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-[#2f80ed] bg-[#2f80ed] text-white shadow-[0_8px_20px_rgba(47,128,237,0.25)]"
                  : "border-[#c8dced] bg-white text-[#294a6d] hover:border-[#2f80ed] hover:text-[#1f6fd1]",
              ].join(" ")}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <div id="log-rowing" className="mt-8">
        <LoggingForm />
      </div>
    </section>
  );
}
