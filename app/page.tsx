"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { signIn } from "@/app/lib/sign-in";
import { signUp } from "@/app/lib/sign-up";

export default function Home() {
  const session = authClient.useSession();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const result = mode === "sign-in"
      ? await signIn(email, password)
      : await signUp(email, password, name);

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message || "Something went wrong. Please try again.");
      return;
    }

    setMessage(mode === "sign-in" ? "You are signed in." : "Your account is ready.");
    setPassword("");
  }

  async function handleSignOut() {
    await authClient.signOut();
    setMessage("You have been signed out.");
  }

  if (session.data?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e8eee9] px-6 py-12 text-[#173b35]">
        <section className="w-full max-w-lg rounded-[2rem] bg-[#fffdf7] p-8 shadow-[0_24px_80px_rgba(23,59,53,0.14)] sm:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#cf633f]">Erg Master</p>
          <h1 className="text-4xl font-semibold tracking-tight">Welcome back, {session.data.user.name}.</h1>
          <p className="mt-4 text-[#5b6d66]">Signed in as {session.data.user.email}</p>
          <button onClick={handleSignOut} className="mt-8 w-full rounded-xl bg-[#173b35] px-5 py-3 font-semibold text-white transition hover:bg-[#28554b]">
            Sign out
          </button>
          {message && <p className="mt-4 text-center text-sm text-[#5b6d66]">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8eee9] px-6 py-12 text-[#173b35]">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-[#fffdf7] shadow-[0_24px_80px_rgba(23,59,53,0.14)] md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-[#173b35] p-8 text-[#fffdf7] sm:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2a27b]">Erg Master</p>
            <h1 className="mt-16 text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">Train with intention.</h1>
            <p className="mt-6 max-w-xs text-lg leading-7 text-[#c8d8ce]">Your rowing workbench for steady progress, one session at a time.</p>
          </div>
          <p className="mt-16 text-sm text-[#91b1a0]">A calmer way to keep your momentum.</p>
        </div>
        <div className="p-8 sm:p-12">
          <div className="mb-10 flex gap-6 border-b border-[#d9e1d9]">
            {(["sign-in", "sign-up"] as const).map((item) => (
              <button key={item} onClick={() => { setMode(item); setMessage(""); }} className={`-mb-px border-b-2 pb-3 text-sm font-semibold ${mode === item ? "border-[#cf633f] text-[#cf633f]" : "border-transparent text-[#829189]"}`}>
                {item === "sign-in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">{mode === "sign-in" ? "Good to see you." : "Start your logbook."}</h2>
          <p className="mt-2 text-[#5b6d66]">{mode === "sign-in" ? "Enter your details to continue." : "Set up your account in a few seconds."}</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === "sign-up" && <label className="block text-sm font-semibold">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#ccd8cf] bg-transparent px-4 py-3 font-normal outline-none transition focus:border-[#cf633f]" /></label>}
            <label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#ccd8cf] bg-transparent px-4 py-3 font-normal outline-none transition focus:border-[#cf633f]" /></label>
            <label className="block text-sm font-semibold">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#ccd8cf] bg-transparent px-4 py-3 font-normal outline-none transition focus:border-[#cf633f]" /></label>
            <button disabled={isSubmitting} className="w-full rounded-xl bg-[#cf633f] px-5 py-3 font-semibold text-white transition hover:bg-[#b94f30] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}</button>
          </form>
          {message && <p role="status" className="mt-4 text-sm text-[#5b6d66]">{message}</p>}
        </div>
      </section>
    </main>
  );
}
