import { ArrowRight, Bot, BookOpen, NotebookText, RotateCcw } from "lucide-react";
import { EmptyState, ProgressBar } from "../components/Shell.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { useState } from "react";

export function Dashboard({ go }) {
  const { subjects, createSubject, isGuest } = useStudyBuddy();
  const [name, setName] = useState("");
  const lastTopic = subjects.flatMap((subject) => subject.topics.map((topic) => ({ ...topic, subjectId: subject.id }))).at(0);

  async function addSubject(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await createSubject(name.trim());
    setName("");
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Subjects Overview</h2>
            <form onSubmit={addSubject} className="flex gap-2">
              <input
                className="w-40 rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                  className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{subject.name}</h3>
                      <p className="text-sm text-slate-500">{subject.topics.length} topics</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-400" />
                  </div>
                  <div className="mt-5">
                    <ProgressBar value={subject.progress} />
                    <p className="mt-2 text-sm font-semibold text-slate-600">{subject.progress}% complete</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-black">Continue Where You Left Off</h3>
            {lastTopic ? (
              <button onClick={() => go("topic", { subjectId: lastTopic.subjectId, topicId: lastTopic.id })} className="mt-4 w-full rounded-xl bg-blue-50 p-4 text-left text-blue-800">
                <span className="font-bold">{lastTopic.name}</span>
                <span className="block text-sm">{lastTopic.progress}% studied</span>
              </button>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Add a topic to start your first session.</p>
            )}
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-black">AI Recommendations</h3>
            <p className="mt-3 text-sm text-slate-600">Review your lowest-progress topic, then ask AI to explain it with examples.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
