import { useEffect, useState } from "react";
import { useStudyBuddy } from "../context/AppContext.jsx";
import { parseFlashcards } from "../lib/guestStore.js";

export function NotesPage({ go }) {
  const { subjects, createNote, updateNote, createFlashcard, runTopicTool } = useStudyBuddy();
  const topics = subjects.flatMap((subject) => subject.topics.map((topic) => ({ ...topic, subjectId: subject.id, subjectName: subject.name })));
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const topic = topics.find((item) => item.id === topicId);

  useEffect(() => {
    if (topics.length && !topics.some((item) => item.id === topicId)) {
      setTopicId(topics[0].id);
    }
  }, [topicId, topics]);

  async function save(event) {
    event.preventDefault();
    if (!topic || !content.trim()) return;
    await createNote(topic.id, content.trim());
    setContent("");
    setStatus("Note saved.");
  }

  async function convert() {
    if (!topic) return;
    setStatus("Generating flashcards...");
    const data = await runTopicTool("flashcards", topic);
    const cards = parseFlashcards(data.answer).slice(0, 8);
    for (const card of cards) {
      await createFlashcard(topic.id, card.question, card.answer);
    }
    setStatus(`${cards.length} flashcards added to ${topic.name}.`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Notes</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Create, edit, and convert topic notes into flashcards.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Topic</label>
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-[#102044] dark:text-white"
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
            disabled={!topics.length}
          >
            {topics.map((item) => (
              <option key={item.id} value={item.id}>{item.subjectName}: {item.name}</option>
            ))}
          </select>
          <button onClick={convert} disabled={!topic} className="mt-4 w-full rounded-xl bg-purple-600 px-4 py-3 font-bold text-white disabled:opacity-50">
            Convert notes to flashcards
          </button>
          {status && <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">{status}</p>}
        </aside>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
          <form onSubmit={save} className="space-y-3">
            <textarea
              className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
              placeholder={topic ? `New note for ${topic.name}` : "Create a topic first"}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!topic}
            />
            <button disabled={!topic} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50">Create note</button>
          </form>

          <div className="mt-6 space-y-4">
            {topic?.notes.map((note) => (
              <EditableNote key={note.id} note={note} topicId={topic.id} updateNote={updateNote} />
            ))}
            {!topic?.notes.length && <p className="text-sm text-slate-500 dark:text-slate-400">No notes for this topic yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function EditableNote({ note, topicId, updateNote }) {
  const [value, setValue] = useState(note.content);
  const [saved, setSaved] = useState(false);

  async function save() {
    await updateNote(topicId, note.id, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <article className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      {note.content.startsWith("WHITEBOARD_NOTE::") && (
        <img src={note.content.replace("WHITEBOARD_NOTE::", "")} alt="Whiteboard note" className="mb-3 max-h-96 w-full rounded-xl bg-white object-contain" />
      )}
      <textarea
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button onClick={save} className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
        {saved ? "Saved" : "Save edit"}
      </button>
    </article>
  );
}

