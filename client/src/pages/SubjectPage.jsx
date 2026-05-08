import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { EmptyState, ProgressBar } from "../components/Shell.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function SubjectPage({ go, subjectId }) {
  const { subjects, createTopic } = useStudyBuddy();
  const [name, setName] = useState("");
  const subject = subjects.find((item) => item.id === subjectId);

  if (!subject) return <EmptyState title="Subject not found" text="Return home and select a subject." />;

  async function addTopic(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await createTopic(subject.id, name.trim());
    setName("");
  }

  return (
    <div className="space-y-6">
      <button onClick={() => go("home")} className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <ArrowLeft size={17} /> Home
      </button>
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">{subject.name}</h1>
        <p className="mt-1 text-slate-500">Subject progress</p>
        <div className="mt-5 max-w-lg">
          <ProgressBar value={subject.progress} />
          <p className="mt-2 text-sm font-semibold text-slate-600">{subject.progress}% complete</p>
        </div>
      </section>
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black">Topics</h2>
          <form onSubmit={addTopic} className="flex gap-2">
            <input
              className="rounded-xl border border-slate-200 px-4 py-2"
              placeholder="Add topic"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white" title="Add topic">
              <Plus size={18} />
            </button>
          </form>
        </div>
        {!subject.topics.length ? (
          <div className="mt-5">
            <EmptyState title="No topics yet" text="Create a topic before adding notes or flashcards." />
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {subject.topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => go("topic", { subjectId: subject.id, topicId: topic.id })}
                className="rounded-2xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black">{topic.name}</h3>
                    <p className="text-sm text-slate-500">{topic.notes.length} notes / {topic.flashcards.length} flashcards</p>
                  </div>
                  <span className="text-sm font-bold text-blue-700">{topic.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
