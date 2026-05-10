import { HelpCircle, LogIn, LogOut, MessageSquare, ShieldCheck } from "lucide-react";
import { AuthPanel } from "../components/AuthPanel.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function SettingsPage({ go }) {
  const { isGuest, user, logout, theme, toggleTheme, guestData } = useStudyBuddy();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Settings</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Account, language, help, and app info.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <SettingCard title="Appearance" text={`Current theme: ${theme}`}>
            <button onClick={toggleTheme} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
              Switch to {theme === "dark" ? "light" : "dark"} mode
            </button>
          </SettingCard>

          <SettingCard title="Language" text="English is active. More languages can be added later.">
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 dark:border-white/10 dark:bg-[#102044] dark:text-white">
              <option>English</option>
            </select>
          </SettingCard>

          <SettingCard title="Version info" text="StudyBuddy.AI v1.0.0 - public beta." icon={ShieldCheck} />

          <SettingCard title="Help" text="Need help using notes, tasks, flashcards, or AI chat?" icon={HelpCircle}>
            <a href="mailto:feedback@studybuddy.local" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
              Contact help
            </a>
          </SettingCard>

          <SettingCard title="Send feedback" text="Tell us what to improve next." icon={MessageSquare}>
            <a href="mailto:feedback@studybuddy.local?subject=StudyBuddy%20Feedback" className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white">
              Send feedback
            </a>
          </SettingCard>

          <SettingCard title={isGuest ? "Guest session" : "Account"} text={isGuest ? "You are using temporary guest progress." : `Signed in as ${user?.email}`} icon={isGuest ? LogIn : LogOut}>
            <button
              onClick={() => {
                logout();
                go("onboarding");
              }}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
            >
              {isGuest ? "Reset guest session" : "Log out"}
            </button>
          </SettingCard>
        </section>

        <aside className="rounded-3xl bg-gradient-to-br from-blue-700 to-purple-700 p-6 text-white shadow-soft">
          <h2 className="text-2xl font-black">Study profile</h2>
          <p className="mt-3 text-sm opacity-85">
            {guestData.selectedLevel || "Level not set"} {guestData.selectedGrade ? `/ ${guestData.selectedGrade}` : ""}
          </p>
          <p className="mt-4 text-sm opacity-85">Use the same email and password on your phone, iPad, or computer to access your saved account.</p>
        </aside>
      </div>

      {isGuest && (
        <div className="mx-auto max-w-md">
          <AuthPanel defaultMode="login" onDone={() => go("home")} />
        </div>
      )}
    </div>
  );
}

function SettingCard({ title, text, children, icon: Icon }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-[#0b1730]/90 dark:ring-white/10">
      <div className="flex gap-4">
        {Icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </article>
  );
}

