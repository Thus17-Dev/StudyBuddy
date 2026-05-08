import { useState } from "react";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { AuthPanel } from "../components/AuthPanel.jsx";

const levels = ["Middle School", "High School", "College", "Self Study"];
const starterSubjects = ["Math", "Science", "English", "History", "Computer Science", "Biology"];

export function Onboarding({ go }) {
  const { continueAsGuest } = useStudyBuddy();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("High School");
  const [selected, setSelected] = useState(["Math", "Science"]);

  function toggleSubject(name) {
    setSelected((items) => (items.includes(name) ? items.filter((item) => item !== name) : [...items, name]));
  }

  async function guest() {
    await continueAsGuest(level, selected.length ? selected : ["General Study"]);
    go("home");
  }

  const screens = [
    <div>
      <h1 className="text-4xl font-black text-slate-950">Welcome to better studying.</h1>
      <p className="mt-3 text-slate-600">Organize topics, ask AI for help, generate flashcards, and keep your momentum.</p>
      <button onClick={() => setStep(1)} className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white">
        Continue
      </button>
    </div>,
    <div>
      <h2 className="text-3xl font-black">Choose your level</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {levels.map((item) => (
          <button
            key={item}
            onClick={() => setLevel(item)}
            className={`rounded-2xl border p-4 text-left font-semibold ${
              level === item ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <button onClick={() => setStep(2)} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white">
        Next
      </button>
    </div>,
    <div>
      <h2 className="text-3xl font-black">Select subjects</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {starterSubjects.map((subject) => (
          <button
            key={subject}
            onClick={() => toggleSubject(subject)}
            className={`rounded-2xl border p-4 text-left font-semibold ${
              selected.includes(subject) ? "border-purple-600 bg-purple-50 text-purple-700" : "border-slate-200 bg-white"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
      <button onClick={() => setStep(3)} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white">
        Next
      </button>
    </div>,
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <div>
        <h2 className="text-3xl font-black">Ready when you are.</h2>
        <p className="mt-3 text-slate-600">Use StudyBuddy.AI now as a guest, or create an account to keep your progress across devices.</p>
        <button onClick={guest} className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">
          Continue as Guest
        </button>
      </div>
      <AuthPanel onDone={() => go("home")} />
    </div>
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eff6ff,#faf5ff)] px-5 py-10 dark:bg-[linear-gradient(135deg,#070b18,#111827)]">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:bg-slate-950/72 sm:p-10 screen-enter">
        <p className="mb-6 text-sm font-bold uppercase tracking-wide text-blue-600">Step {step + 1} of 4</p>
        {screens[step]}
      </section>
    </main>
  );
}
