import { Bot, CheckSquare, Home, Moon, NotebookText, Settings, Sun, UserRound } from "lucide-react";
import { useStudyBuddy } from "../context/AppContext.jsx";

const nav = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "AI Chat", icon: Bot },
  { id: "notes", label: "Notes", icon: NotebookText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "profile", label: "Profile", icon: UserRound }
];

export function Shell({ children, current, go }) {
  const { user, isGuest, theme, toggleTheme } = useStudyBuddy();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,#bfdbfe,transparent_26%),radial-gradient(circle_at_85%_0%,#e9d5ff,transparent_28%),linear-gradient(135deg,#f8fbff,#f7f3ff)] pb-24 text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,.34),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(147,51,234,.28),transparent_28%),linear-gradient(135deg,#061a3a,#102044)] dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/78 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#07152f]/84">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <button onClick={() => go("home")} className="flex items-center gap-2 rounded-lg text-left">
            <img src="/icons/logo-192.png" alt="StudyBuddy.AI" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-black leading-tight text-slate-950 dark:text-white">StudyBuddy.AI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isGuest ? "Guest progress" : user?.name}</p>
            </div>
          </button>
          <div className="ml-auto hidden flex-1 max-w-md items-center rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-500 ring-1 ring-transparent transition-colors sm:flex dark:bg-[#102044] dark:text-slate-400 dark:ring-white/10">
            Search subjects, topics, notes...
          </div>
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 dark:bg-[#102044] dark:text-slate-200 dark:ring-white/10"
            title={theme === "dark" ? "Use light mode" : "Use dark mode"}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            onClick={() => go("settings")}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 dark:bg-[#102044] dark:text-slate-200 dark:ring-white/10"
            title="Settings"
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 screen-enter">{children}</main>

      <footer className="fixed bottom-3 left-1/2 z-30 w-[min(94vw,620px)] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/90 p-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-[#07152f]/92">
        <nav className="grid grid-cols-5 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = current === item.id || (item.id === "home" && current === "subject");
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition ${
                  active ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-white/15 dark:bg-white/5">
      <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action}
    </div>
  );
}

export function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
      />
    </div>
  );
}

