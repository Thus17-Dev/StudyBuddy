                                           import { useState } from "react";
import { ArrowLeft, Bot, BookOpen, ChevronDown, ChevronRight, Layers, Sparkles } from "lucide-react";
import { EmptyState, ProgressBar } from "../components/Shell.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { parseFlashcards } from "../lib/guestStore.js";
import { WhiteboardNote } from "../components/WhiteboardNote.jsx";

export function TopicPage({ go, subjectId, topicId }) {
  const { subjects, createNote, createFlashcard, runTopicTool, updateProgress } = useStudyBuddy();
  const [note, setNote] = useState("");
  const [manualCard, setManualCard] = useState({ question: "", answer: "" });
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState("");
  const [openSections, setOpenSections] = useState({ notes: true, flashcards: true, ai: true });
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

  async function saveWhiteboard(content) {
    await createNote(topic.id, content);
    await updateProgress(topic.id, Math.max(topic.progress || 0, 15));
  }

  function toggleSection(name) {
    setOpenSections((current) => ({ ...current, [name]: !current[name] }));
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
      <button onClick={() => go("subject", { subjectId })} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
        <ArrowLeft size={17} /> {subject.name}
      </button>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">{topic.name}</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Only notes and flashcards linked to this topic are shown here.</p>
          </div>
          <button onClick={() => go("study", { subjectId, topicId })} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">
            Study Session
          </button>
        </div>
        <div className="mt-5 max-w-lg">
          <ProgressBar value={topic.progress} />
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{topic.progress}% complete</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
            <SectionButton title="Notes" open={openSections.notes} onClick={() => toggleSection("notes")} />
            {openSections.notes && (
              <>
                <form onSubmit={addNote} className="mt-4 space-y-3">
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
                    placeholder={`Write notes for ${topic.name}`}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <button className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Save note</button>
                </form>
                <WhiteboardNote topicName={topic.name} onSave={saveWhiteboard} />
                <div className="mt-5 space-y-3">
                  {topic.notes.map((item) => (
                    <article key={item.id} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                      <NoteContent content={item.content} />
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
            <SectionButton title="Flashcards" open={openSections.flashcards} onClick={() => toggleSection("flashcards")} />
            {openSections.flashcards && (
              <>
                <form onSubmit={addManualFlashcard} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
                    placeholder="Question"
                    value={manualCard.question}
                    onChange={(event) => setManualCard({ ...manualCard, question: event.target.value })}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
                    placeholder="Answer"
                    value={manualCard.answer}
                    onChange={(event) => setManualCard({ ...manualCard, answer: event.target.value })}
                  />
                  <button className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white sm:col-span-2">
                    Add flashcard
                  </button>
                </form>
                {!topic.flashcards.length ? (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Generate flashcards with AI or add them from the Notes page.</p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {topic.flashcards.map((card) => (
                      <div key={card.id} className="rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-400/20 dark:bg-purple-500/10">
                        <p className="font-bold text-purple-900 dark:text-purple-100">{card.question}</p>
                        <p className="mt-2 text-sm text-purple-800 dark:text-purple-200">{card.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <SectionButton title="AI tools" open={openSections.ai} onClick={() => toggleSection("ai")} />
          {openSections.ai && (
            <>
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
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4 text-left font-bold text-slate-800 transition hover:bg-blue-50 disabled:opacity-60 dark:border-white/10 dark:text-slate-100 dark:hover:bg-blue-500/10"
                  >
                    <Icon size={20} className="text-blue-600" />
                    {loading === tool ? "Thinking..." : label}
                  </button>
                ))}
              </div>
              {aiResult && (
                <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-[#102044] p-4 text-sm leading-6 text-white">
                  {aiResult}
                </div>
              )}
            </>
          )}
        </aside>
      </section>
    </div>
  );
}

function SectionButton({ title, open, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between text-left">
      <span className="text-xl font-black text-slate-950 dark:text-white">{title}</span>
      {open ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
    </button>
  );
}

function NoteContent({ content }) {
  if (content.startsWith("WHITEBOARD_NOTE::")) {
    return <img src={content.replace("WHITEBOARD_NOTE::", "")} alt="Whiteboard note" className="max-h-96 w-full rounded-xl object-contain bg-white" />;
  }

  return <div className="whitespace-pre-wrap">{content}</div>;
}

