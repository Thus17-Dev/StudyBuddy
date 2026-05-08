import { AuthPanel } from "../components/AuthPanel.jsx";
import { useStudyBuddy } from "../context/AppContext.jsx";

export function ProfilePage({ go }) {
  const { user, isGuest, logout, subjects, guestData } = useStudyBuddy();
  const topicCount = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const cardCount = subjects.reduce((sum, subject) => sum + subject.topics.reduce((inner, topic) => inner + topic.flashcards.length, 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">Profile</h1>
        <p className="mt-1 text-slate-500">{isGuest ? "Guest learner" : user?.email}</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-4 sm:grid-cols-3">
          <Stat label="Streak" value={`${guestData.streak || 1} day`} />
          <Stat label="Topics" value={topicCount} />
          <Stat label="Flashcards" value={cardCount} />
          <div className="rounded-3xl bg-white p-5 shadow-sm sm:col-span-3">
            <h2 className="text-xl font-black">Achievements</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Started learning", "Built a study plan", cardCount > 0 ? "Made flashcards" : "Ready for revision"].map((item) => (
                <span key={item} className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm sm:col-span-3">
            <h2 className="text-xl font-black">Settings</h2>
            <button onClick={logout} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">
              {isGuest ? "Reset session" : "Log out"}
            </button>
          </div>
        </section>
        {isGuest ? <AuthPanel onDone={() => go("home")} /> : (
          <aside className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-soft">
            <h2 className="text-2xl font-black">Progress saved</h2>
            <p className="mt-2 text-sm opacity-85">Your subjects, topics, notes, flashcards, and tasks are stored in your account.</p>
          </aside>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
