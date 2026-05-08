export function Splash({ onStart }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_20%,#bfdbfe,transparent_30%),linear-gradient(135deg,#eef6ff,#f7efff)] px-5">
      <section className="max-w-xl text-center screen-enter">
        <img
          src="/icons/logo-512.png"
          alt="StudyBuddy.AI logo"
          className="mx-auto h-28 w-28 rounded-3xl object-cover shadow-soft"
        />
        <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">StudyBuddy.AI</h1>
        <p className="mt-3 text-lg font-medium text-slate-600">Your Personal AI Assistant</p>
        <button
          onClick={onStart}
          className="mt-8 rounded-2xl bg-slate-950 px-8 py-4 font-bold text-white shadow-soft transition hover:-translate-y-0.5"
        >
          Start Studying!
        </button>
      </section>
    </main>
  );
}
