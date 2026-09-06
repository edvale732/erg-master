import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#071a33] px-6 text-center text-[#f7fbff]">
      <h1 className="text-7xl font-semibold tracking-tight sm:text-9xl">Erg Master</h1>
      <Link
        href="/login"
        className="rounded-xl bg-[#2f80ed] px-6 py-3.5 font-semibold text-white transition hover:bg-[#1f6fd1]"
      >
        Sign in
      </Link>
    </main>
  );
}
