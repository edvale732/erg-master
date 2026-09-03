import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#e8eee9] text-[#173b35]">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">
          Erg Master
        </Link>
        <Link href="/login" className="rounded-xl border border-[#173b35] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#173b35] hover:text-white">
          Sign in
        </Link>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-24">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">Your rowing workbench</p>
          <h1 className="max-w-3xl text-6xl font-semibold leading-[0.92] tracking-tight sm:text-8xl">
            Make every stroke count.
          </h1>
          <p className="mt-8 max-w-xl text-xl leading-8 text-[#5b6d66]">
            Track your training, see your progress, and build a practice that keeps moving forward.
          </p>
          <Link href="/login" className="mt-10 inline-flex rounded-xl bg-[#cf633f] px-6 py-3.5 font-semibold text-white transition hover:bg-[#b94f30]">
            Start your logbook
          </Link>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[#173b35] p-8 text-[#fffdf7] shadow-[0_24px_80px_rgba(23,59,53,0.18)] sm:min-h-[460px] sm:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[32px] border-[#cf633f] opacity-90" />
          <div className="relative flex h-full flex-col justify-between">
            <p className="max-w-xs text-3xl font-semibold leading-tight">A calmer way to keep your momentum.</p>
            <div>
              <p className="text-7xl font-semibold tracking-tight">01</p>
              <p className="mt-2 text-[#91b1a0]">One session at a time.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
