import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#e8eee9] px-6 text-center text-[#173b35]">
      <h1 className="text-7xl font-semibold tracking-tight sm:text-9xl">Erg Master</h1>
      <Link
        href="/login"
        className="rounded-xl bg-[#cf633f] px-6 py-3.5 font-semibold text-white transition hover:bg-[#b94f30]"
      >
        Sign in
      </Link>
    </main>
  );
}
