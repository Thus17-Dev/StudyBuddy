import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function TasksPage() {
  const { subjects, createTask, toggleTask } = useStudyBuddy();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(() => localStorage.getItem("studybuddy.reminders") === "on");

  useEffect(() => {
    if (subjects.length && !subjects.some((subject) => subject.id === subjectId)) {
      setSubjectId(subjects[0].id);
    }
  }, [subjectId, subjects]);

  async function addTask(event) {
    event.preventDefault();
    if (!subjectId || !title.trim()) return;
    await createTask(subjectId, title.trim(), dueDate || null);
    setTitle("");
    setDueDate("");
  }

  const tasks = subjects.flatMap((subject) =>
    subject.tasks.map((task) => ({ ...task, subjectName: subject.name }))
  );

  useEffect(() => {
    if (!remindersEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const notified = JSON.parse(localStorage.getItem("studybuddy.notifiedTasks") || "[]");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      if (!task.dueDate || task.completed || notified.includes(task.id)) continue;
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due <= today) {
        new Notification("StudyBuddy task reminder", {
          body: `${task.title} is due ${due.toLocaleDateString()} (${task.subjectName})`,
          icon: "/icons/logo-192.png"
        });
        notified.push(task.id);
      }
    }
    localStorage.setItem("studybuddy.notifiedTasks", JSON.stringify(notified));
  }, [tasks, remindersEnabled]);

  async function enableReminders() {
    if (!("Notification" in window)) {
      alert("This browser does not support reminders.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem("studybuddy.reminders", "on");
      setRemindersEnabled(true);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">Tasks</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Add homework, set due dates, and mark work complete.</p>
          </div>
          <button onClick={enableReminders} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            {remindersEnabled ? "Reminders on" : "Enable reminders"}
          </button>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={addTask} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Subject</label>
          <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-[#102044] dark:text-white" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} disabled={!subjects.length}>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <input
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
            placeholder="Homework title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <button disabled={!subjects.length} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50">Add homework</button>
        </form>
        <section className="space-y-3">
          {tasks.map((task) => (
            <article key={task.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
              <button
                onClick={() => toggleTask(task.id, !task.completed)}
                className={`grid h-10 w-10 place-items-center rounded-xl ${task.completed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"}`}
              >
                <CalendarCheck size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <h3 className={`font-bold ${task.completed ? "text-slate-400 line-through" : "text-slate-950 dark:text-white"}`}>{task.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{task.subjectName}{task.dueDate ? ` / due ${new Date(task.dueDate).toLocaleDateString()}` : ""}</p>
              </div>
            </article>
          ))}
          {!tasks.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm dark:bg-[#0b1730]/90 dark:text-slate-400">No tasks yet.</p>}
        </section>
      </div>
    </div>
  );
}

