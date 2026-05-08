                                           import { useState } from "react";
import { ArrowLeft, Bot, BookOpen, Layers, Sparkles } from "lucide-react";
import { EmptyState, ProgressBar } from "../components/Shell.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { parseFlashcards } from "../lib/guestStore.js";

export function TopicPage({ go, subjectId, topicId }) {
  const { subjects, createNote, createFlashcard, runTopicTool, updateProgress } = useStudyBuddy();
  const [note, setNote] = useState("");
  const [manualCard, setManualCard] = useState({ question: "", answer: "" });
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState("");
  const subject = subjects.find((item) => item.id === subjectId);
  const topic = subject?.topics.find((item) => item.id === topicId);

  if (!subject || !topic) return <EmptyState title="Topic not found" text="Return home and select a topic." />;

  async function addNote(event) {
    event.preventDefault();
    if (!note.trim()) return;
    await createNote(topic.id, note.trim());
    await updateProgress(topic.id, Math.max(topic.progress || 0, 15));
    setNote("");
  }

  async function ai(tool) {
    setLoading(tool);
    try {
      const data = await runTopicTool(tool, topic);
      setAiResult(data.answer);
      if (tool === "flashcards") {
        const cards = parseFlashcards(data.answer).slice(0, 8);
        for (const card of cards) {
          await createFlashcard(topic.id, card.question, card.answer);
        }
      }
      await updateProgress(topic.id, Math.min(100, (topic.progress || 0) + 10));
    } catch (error) {
      setAiResult(error.message || "AI is not available right now.");
    } finally {
      setLoading("");
    }
  }

  async function addManualFlashcard(event) {
    event.preventDefault();
    if (!manualCard.question.trim() || !manualCard.answer.trim()) return;
    await createFlashcard(topic.id, manualCard.question.trim(), manualCard.answer.trim());
    await updateProgress(topic.id, Math.max(topic.progress || 0, 20));
    setManualCard({ question: "", answer: "" });
  }

  return (
    <div className="space-y-6">
      <button onClick={() => go("subject", { subjectId })} className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <ArrowLeft size={17} /> {subject.name}
      </button>
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">{topic.name}</h1>
            <p className="mt-1 text-slate-500">Only notes and flashcards linked to this topic are shown here.</p>
          </div>
          <button onClick={() => go("study", { subjectId, topicId })} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">
            Study Session
          </button>
        </div>
        <div className="mt-5 max-w-lg">
          <ProgressBar value={topic.progress} />
          <p className="mt-2 text-sm font-semibold text-slate-600">{topic.progress}% complete</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Notes</h2>
            <form onSubmit={addNote} className="mt-4 space-y-3">
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 p-4"
                placeholder={`Write notes for ${topic.name}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <button className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Save note</button>
            </form>
            <div className="mt-5 space-y-3">
              {topic.notes.map((item) => (
                <article key={item.id} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item.content}
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Flashcards</h2>
            <form onSubmit={addManualFlashcard} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Question"
                value={manualCard.question}
                onChange={(event) => setManualCard({ ...manualCard, question: event.target.value })}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Answer"
                value={manualCard.answer}
                onChange={(event) => setManualCard({ ...manualCard, answer: event.target.value })}
              />
              <button className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white sm:col-span-2">
                Add flashcard
              </button>
            </form>
            {!topic.flashcards.length ? (
              <p className="mt-3 text-sm text-slate-500">Generate flashcards with AI or add them from the Notes page.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {topic.flashcards.map((card) => (
                  <div key={card.id} className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                    <p className="font-bold text-purple-900">{card.question}</p>
                    <p className="mt-2 text-sm text-purple-800">{card.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">AI tools</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["explain", "Explain", Bot],
              ["summarise", "Summarise", BookOpen],
              ["flashcards", "Generate Flashcards", Layers],
              ["practice", "Practice Questions", Sparkles]
            ].map(([tool, label, Icon]) => (
              <button
                key={tool}
                onClick={() => ai(tool)}
                disabled={Boolean(loading)}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4 text-left font-bold transition hover:bg-blue-50 disabled:opacity-60"
              >
                <Icon size={20} className="text-blue-600" />
                {loading === tool ? "Thinking..." : label}
              </button>
            ))}
          </div>
          {aiResult && (
            <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">
              {aiResult}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
