import { useState } from "react";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function AuthPanel({ onDone }) {
  const { signup, login, busy, error, isGuest } = useStudyBuddy();
  const [mode, setMode] = useState("signup");
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
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg py-2 ${mode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}
        >
          Sign up
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2 ${mode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}
        >
          Login
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        )}
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Password"
          type="password"
          minLength={mode === "signup" ? 8 : 1}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {isGuest && mode === "signup" && (
          <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
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
