import { useState } from "react";
import { Send } from "lucide-react";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function AIChatPage() {
  const { askAI } = useStudyBuddy();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm StudyBuddy.AI. Ask me to explain, summarise, solve, or create flashcards." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">AI Chat</h1>
        <p className="mt-1 text-slate-500">Ask questions, summaries, solve problems, or create flashcards.</p>
      </section>
      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="max-h-[58vh] space-y-3 overflow-auto p-2">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <p className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {message.content}
              </p>
            </div>
          ))}
          {loading && <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Thinking...</p>}
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Ask StudyBuddy.AI..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white" title="Send">
            <Send size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}
