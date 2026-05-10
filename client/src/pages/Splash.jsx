export function Splash({ onStart }) {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#bfdbfe,transparent_30%),radial-gradient(circle_at_80%_0%,#ddd6fe,transparent_28%),linear-gradient(135deg,#eef6ff,#f7efff)] px-5 text-slate-950 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.38),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(147,51,234,.32),transparent_28%),linear-gradient(135deg,#061a3a,#102044)] dark:text-white">
      <section className="max-w-xl text-center screen-enter">
        <img
          src="/icons/logo-512.png"
          alt="StudyBuddy.AI logo"
          className="mx-auto h-32 w-32 rounded-[2rem] object-cover shadow-soft ring-1 ring-white/70 dark:ring-white/10"
        />
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">StudyBuddy.AI</h1>
        <p className="mt-3 text-lg font-medium text-slate-600 dark:text-slate-300">Your personal AI study assistant</p>
        <button
          onClick={onStart}
          className="mt-8 rounded-2xl bg-slate-950 px-8 py-4 font-bold text-white shadow-soft transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
        >
          Start studying
        </button>
      </section>
    </main>
  );
}

