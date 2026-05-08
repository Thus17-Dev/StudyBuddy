import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function TasksPage() {
  const { subjects, createTask, toggleTask } = useStudyBuddy();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">Tasks</h1>
        <p className="mt-1 text-slate-500">Add homework, set due dates, and mark work complete.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={addTask} className="rounded-3xl bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-500">Subject</label>
          <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} disabled={!subjects.length}>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <input
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Homework title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <button disabled={!subjects.length} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50">Add homework</button>
        </form>
        <section className="space-y-3">
          {tasks.map((task) => (
            <article key={task.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <button
                onClick={() => toggleTask(task.id, !task.completed)}
                className={`grid h-10 w-10 place-items-center rounded-xl ${task.completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
              >
                <CalendarCheck size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <h3 className={`font-bold ${task.completed ? "text-slate-400 line-through" : ""}`}>{task.title}</h3>
                <p className="text-sm text-slate-500">{task.subjectName}{task.dueDate ? ` / due ${new Date(task.dueDate).toLocaleDateString()}` : ""}</p>
              </div>
            </article>
          ))}
          {!tasks.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">No tasks yet.</p>}
        </section>
      </div>
    </div>
  );
}
