import { useState } from "react";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function AuthPanel({ onDone, defaultMode = "signup" }) {
  const { signup, login, busy, error, isGuest } = useStudyBuddy();
  const [mode, setMode] = useState(defaultMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function submit(event) {
    event.preventDefault();
    if (mode === "login") {
      await login({ email: form.email, password: form.password });
    } else {
      await signup(form);
    }
    onDone?.();
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
      <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-[#102044]">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg py-2 ${mode === "signup" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
          Sign up
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2 ${mode === "login" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
          Login
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        )}
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
          placeholder="Password"
          type="password"
          minLength={mode === "signup" ? 8 : 1}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {isGuest && mode === "signup" && (
          <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
            Save your progress? Create an account.
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          {busy ? "Working..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
    </div>
  );
}

