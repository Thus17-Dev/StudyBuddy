import { ArrowRight, Bell, Bot, BookOpen, Clock, Flame, NotebookText, RotateCcw } from "lucide-react";
import { EmptyState, ProgressBar } from "../components/Shell.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { useEffect, useMemo, useState } from "react";

export function Dashboard({ go }) {
  const { subjects, createSubject, isGuest, guestData } = useStudyBuddy();
  const [name, setName] = useState("");
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [reviseReminder, setReviseReminder] = useState(() => localStorage.getItem("studybuddy.reviseReminder") === "on");
  const lastTopic = subjects.flatMap((subject) => subject.topics.map((topic) => ({ ...topic, subjectId: subject.id }))).at(0);
  const weakTopics = useMemo(
    () =>
      subjects
        .flatMap((subject) => subject.topics.map((topic) => ({ ...topic, subjectName: subject.name, subjectId: subject.id })))
        .sort((a, b) => (a.progress || 0) - (b.progress || 0))
        .slice(0, 4),
    [subjects]
  );

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds <= 1) {
          setTimerActive(false);
          notify("Focus session complete", "Nice work. Take a short break, then revise one weak topic.");
          return 25 * 60;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  useEffect(() => {
    if (!reviseReminder) return;
    const id = setInterval(() => notify("Time to revise", "Open StudyBuddy and review one weak topic."), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [reviseReminder]);

  async function addSubject(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await createSubject(name.trim());
    setName("");
  }

  async function enableRevisionReminder() {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
    localStorage.setItem("studybuddy.reviseReminder", "on");
    setReviseReminder(true);
    notify("Revision reminders enabled", "I will remind you while StudyBuddy is open.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold opacity-85">{isGuest ? "Guest mode is on" : "Welcome back"}</p>
        <h1 className="mt-2 text-3xl font-black">What are we learning today?</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            ["Continue Studying", BookOpen, () => lastTopic && go("topic", { subjectId: lastTopic.subjectId, topicId: lastTopic.id })],
            ["Ask AI", Bot, () => go("chat")],
            ["Notes", NotebookText, () => go("notes")],
            ["Revision Mode", RotateCcw, () => lastTopic && go("study", { subjectId: lastTopic.subjectId, topicId: lastTopic.id })]
          ].map(([label, Icon, action]) => (
            <button key={label} onClick={action} className="rounded-2xl bg-white/15 p-4 text-left font-bold transition hover:bg-white/25">
              <Icon size={22} />
              <span className="mt-3 block">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-500" />
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Streak</p>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{guestData.streak || 1} day</h2>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Daily motivation: one small revision keeps the streak alive.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-600" />
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Focus mode</p>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{formatTime(focusSeconds)}</h2>
            </div>
          </div>
          <button onClick={() => setTimerActive((active) => !active)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            {timerActive ? "Pause timer" : "Start 25 min"}
          </button>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <div className="flex items-center gap-3">
            <Bell className="text-purple-600" />
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Revision reminders</p>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{reviseReminder ? "On" : "Off"}</h2>
            </div>
          </div>
          <button onClick={enableRevisionReminder} className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white">
            {reviseReminder ? "Reminder enabled" : "Enable reminder"}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Subjects Overview</h2>
            <form onSubmit={addSubject} className="flex gap-2">
              <input
                className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-[#102044] dark:text-white"
                placeholder="New subject"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Add</button>
            </form>
          </div>

          {!subjects.length ? (
            <EmptyState title="No subjects yet" text="Add a subject to create topics, notes, flashcards, and tasks." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => go("subject", { subjectId: subject.id })}
                  className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-soft dark:bg-[#0b1730]/90 dark:ring-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">{subject.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{subject.topics.length} topics</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{subjectIcon(subject.name)}</span>
                      <ArrowRight size={18} className="text-slate-400 dark:text-slate-500" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <ProgressBar value={subject.progress} />
                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{subject.progress}% complete</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
            <h3 className="font-black text-slate-950 dark:text-white">Continue Where You Left Off</h3>
            {lastTopic ? (
              <button onClick={() => go("topic", { subjectId: lastTopic.subjectId, topicId: lastTopic.id })} className="mt-4 w-full rounded-xl bg-blue-50 p-4 text-left text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
                <span className="font-bold">{lastTopic.name}</span>
                <span className="block text-sm">{lastTopic.progress}% studied</span>
              </button>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Add a topic to start your first session.</p>
            )}
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
            <h3 className="font-black text-slate-950 dark:text-white">AI Recommendations</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Review your lowest-progress topic, then ask AI to explain it with examples.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
            <h3 className="font-black text-slate-950 dark:text-white">Smart Revision Table</h3>
            <div className="mt-3 space-y-2">
              {weakTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => go("topic", { subjectId: topic.subjectId, topicId: topic.id })}
                  className="w-full rounded-xl bg-slate-50 p-3 text-left text-sm dark:bg-white/5"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{topic.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{topic.subjectName} / {topic.progress || 0}% / revise soon</span>
                </button>
              ))}
              {!weakTopics.length && <p className="text-sm text-slate-500 dark:text-slate-400">Add topics to build your revision plan.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icons/logo-192.png" });
  }
}

function subjectIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes("math")) return "∑";
  if (lower.includes("science") || lower.includes("physics") || lower.includes("chemistry")) return "⚛";
  if (lower.includes("history")) return "📜";
  if (lower.includes("english")) return "Aa";
  if (lower.includes("biology")) return "🧬";
  if (lower.includes("computer")) return "</>";
  return "✦";
}

