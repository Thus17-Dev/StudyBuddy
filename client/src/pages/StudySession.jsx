import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { EmptyState } from "../components/Shell.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function StudySession({ go, subjectId, topicId }) {
  const { subjects, updateProgress, runTopicTool } = useStudyBuddy();
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [explain, setExplain] = useState("");
  const [loading, setLoading] = useState(false);
  const subject = subjects.find((item) => item.id === subjectId);
  const topic = subject?.topics.find((item) => item.id === topicId);
  const cards = topic?.flashcards || [];
  const card = cards[index];

  const nextProgress = useMemo(() => {
    if (!cards.length) return Math.min(100, (topic?.progress || 0) + 5);
    return Math.min(100, Math.max(topic.progress || 0, Math.round(((index + 1) / cards.length) * 100)));
  }, [cards.length, index, topic]);

  if (!subject || !topic) return <EmptyState title="Topic not found" text="Return home and choose a topic." />;

  async function next() {
    await updateProgress(topic.id, nextProgress);
    setShowAnswer(false);
    setIndex((current) => (current + 1) % Math.max(cards.length, 1));
  }

  async function explainTopic() {
    setLoading(true);
    try {
      const data = await runTopicTool("explain", topic);
      setExplain(data.answer);
      await updateProgress(topic.id, Math.min(100, (topic.progress || 0) + 10));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <button onClick={() => go("topic", { subjectId, topicId })} className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <ArrowLeft size={17} /> Back to topic
      </button>
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">Study Session: {topic.name}</h1>
        <p className="mt-1 text-slate-500">Review flashcards, read notes, and ask for an explanation.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Flashcards mode</h2>
          {!card ? (
            <EmptyState title="No flashcards yet" text="Generate flashcards on the topic page to start revision." />
          ) : (
            <div className="mt-5 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
              <p className="text-sm font-bold opacity-80">Card {index + 1} of {cards.length}</p>
              <h3 className="mt-4 text-2xl font-black">{card.question}</h3>
              {showAnswer && <p className="mt-5 rounded-2xl bg-white/15 p-4 leading-7">{card.answer}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setShowAnswer(true)} className="rounded-xl bg-white px-5 py-3 font-bold text-blue-700">
                  Show answer
                </button>
                <button onClick={next} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">
                  I studied this
                </button>
              </div>
            </div>
          )}
        </section>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Notes view</h2>
            <div className="mt-4 space-y-3">
              {topic.notes.slice(0, 3).map((note) => (
                <p key={note.id} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6">{note.content}</p>
              ))}
              {!topic.notes.length && <p className="text-sm text-slate-500">No notes yet.</p>}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <button onClick={explainTopic} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">
              <CheckCircle2 size={18} /> {loading ? "Explaining..." : "AI explain"}
            </button>
            {explain && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{explain}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

