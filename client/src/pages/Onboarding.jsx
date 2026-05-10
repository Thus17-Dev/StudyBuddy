import { useState } from "react";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { AuthPanel } from "../components/AuthPanel.jsx";

const levels = ["Primary School", "High School", "College", "Self Study"];
const gradeOptions = {
  "Primary School": ["Standard 1", "Standard 2", "Standard 3", "Standard 4", "Standard 5", "Standard 6"],
  "High School": ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5"],
  College: ["Foundation", "Diploma", "Degree", "A-Level", "STPM"],
  "Self Study": ["Personal learning"]
};
const starterSubjects = ["Math", "Science", "English", "History", "Computer Science", "Biology"];

export function Onboarding({ go }) {
  const { continueAsGuest } = useStudyBuddy();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("High School");
  const [grade, setGrade] = useState("Form 1");
  const [selected, setSelected] = useState(["Math", "Science"]);

  function toggleSubject(name) {
    setSelected((items) => (items.includes(name) ? items.filter((item) => item !== name) : [...items, name]));
  }

  async function guest() {
    await continueAsGuest(level, selected.length ? selected : ["General Study"], grade);
    go("home");
  }

  function chooseLevel(item) {
    setLevel(item);
    setGrade(gradeOptions[item][0]);
  }

  const screens = [
    <div>
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">Welcome to better studying.</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">Organize topics, ask AI for help, generate flashcards, and keep your momentum.</p>
      <button onClick={() => setStep(1)} className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white">
        Continue
      </button>
    </div>,
    <div>
      <h2 className="text-3xl font-black text-slate-950 dark:text-white">Choose your level</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {levels.map((item) => (
          <button
            key={item}
            onClick={() => chooseLevel(item)}
            className={`rounded-2xl border p-4 text-left font-semibold ${
              level === item ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200" : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#102044] dark:text-slate-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Year / class</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gradeOptions[level].map((item) => (
          <button
            key={item}
            onClick={() => setGrade(item)}
            className={`rounded-2xl border p-3 text-left text-sm font-semibold ${
              grade === item ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200" : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#102044] dark:text-slate-200"
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
      <h2 className="text-3xl font-black text-slate-950 dark:text-white">Select subjects</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {starterSubjects.map((subject) => (
          <button
            key={subject}
            onClick={() => toggleSubject(subject)}
            className={`rounded-2xl border p-4 text-left font-semibold ${
              selected.includes(subject) ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200" : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#102044] dark:text-slate-200"
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
        <h2 className="text-3xl font-black text-slate-950 dark:text-white">Ready when you are.</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Use StudyBuddy.AI now as a guest, log in on another device, or create an account to keep your progress.</p>
        <button onClick={guest} className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">
          Continue as Guest
        </button>
        <button onClick={() => go("login")} className="ml-0 mt-3 block rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-800 dark:border-white/10 dark:bg-[#102044] dark:text-white sm:ml-3 sm:inline-block">
          I already have an account
        </button>
      </div>
      <AuthPanel onDone={() => go("home")} />
    </div>
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eff6ff,#faf5ff)] px-5 py-10 dark:bg-[linear-gradient(135deg,#061a3a,#102044)]">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:bg-[#0b1730]/90 sm:p-10 screen-enter">
        <p className="mb-6 text-sm font-bold uppercase tracking-wide text-blue-600">Step {step + 1} of 4</p>
        {screens[step]}
      </section>
    </main>
  );
}

