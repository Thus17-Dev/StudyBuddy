import { useState } from "react";
import { Send } from "lucide-react";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function AIChatPage() {
  const { askAI, subjects, createSubject, createTopic, createNote } = useStudyBuddy();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm StudyBuddy.AI. Ask me to explain, summarise, solve, or create flashcards." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savePrompt, setSavePrompt] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const data = await askAI(next.filter((message) => message.role !== "assistant" || message.content !== messages[0].content));
      setMessages([...next, { role: "assistant", content: data.answer }]);
      setSavePrompt({ question: input.trim(), answer: data.answer });
      setSaveStatus("");
    } finally {
      setLoading(false);
    }
  }

  async function addAnswerToNote() {
    if (!savePrompt) return;
    setSaveStatus("Saving...");
    const target = await findOrCreateTarget(savePrompt.question);
    await createNote(
      target.topic.id,
      `AI Chat: ${savePrompt.question}\n\n${savePrompt.answer}`
    );
    setSaveStatus(`Saved to ${target.subject.name} / ${target.topic.name}.`);
  }

  async function findOrCreateTarget(question) {
    const lower = question.toLowerCase();
    const subject =
      subjects.find((item) => lower.includes(item.name.toLowerCase())) ||
      subjects[0] ||
      (await createSubject(guessSubject(question)));

    const refreshedSubject = subjects.find((item) => item.id === subject.id) || subject;
    const topicName = guessTopic(question, refreshedSubject.name);
    const topic =
      (refreshedSubject.topics || []).find((item) => lower.includes(item.name.toLowerCase())) ||
      (await createTopic(refreshedSubject.id, topicName));

    return { subject: refreshedSubject, topic };
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">AI Chat</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Ask questions, summaries, solve problems, or create flashcards.</p>
      </section>
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
        <div className="max-h-[58vh] space-y-3 overflow-auto p-2">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <p className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
              }`}>
                {message.content}
              </p>
            </div>
          ))}
          {loading && <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">Thinking...</p>}
        </div>
        {savePrompt && (
          <div className="mx-2 mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">Add this answer to your notes?</p>
              <button onClick={addAnswerToNote} className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white">
                Add to note
              </button>
            </div>
            {saveStatus && <p className="mt-2 text-xs">{saveStatus}</p>}
          </div>
        )}
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none dark:border-white/10 dark:bg-[#102044] dark:text-white"
            placeholder="Ask StudyBuddy.AI..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950" title="Send">
            <Send size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}

function guessSubject(question) {
  const lower = question.toLowerCase();
  if (/(math|algebra|geometry|calculus|number)/.test(lower)) return "Math";
  if (/(science|physics|chemistry|biology|cell|force|atom)/.test(lower)) return "Science";
  if (/(english|essay|grammar|poem|novel)/.test(lower)) return "English";
  if (/(history|president|war|country|government)/.test(lower)) return "History";
  return "General Study";
}

function guessTopic(question, subjectName) {
  const cleaned = question
    .replace(/^(can i know|tell me|explain|what is|who is|how to)\s+/i, "")
    .replace(/[?!.]/g, "")
    .trim();
  if (cleaned.length >= 3 && cleaned.length <= 60) return titleCase(cleaned);
  return `${subjectName} Notes`;
}

function titleCase(text) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

