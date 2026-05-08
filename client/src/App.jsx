import { AppProvider, useStudyBuddy } from "./context/AppContext.jsx";
import { Shell } from "./components/Shell.jsx";
import { Component, useState } from "react";
import { Splash } from "./pages/Splash.jsx";
import { Onboarding } from "./pages/Onboarding.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { SubjectPage } from "./pages/SubjectPage.jsx";
import { TopicPage } from "./pages/TopicPage.jsx";
import { StudySession } from "./pages/StudySession.jsx";
import { NotesPage } from "./pages/NotesPage.jsx";
import { TasksPage } from "./pages/TasksPage.jsx";
import { AIChatPage } from "./pages/AIChatPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";

function Router() {
  const { guestData, token } = useStudyBuddy();
  const [view, setView] = useState({ name: "splash" });
  const onboarded = token || guestData.onboardingDone;

  function go(name, params = {}) {
    setView({ name, ...params });
  }

  if (view.name === "splash") return <Splash onStart={() => go(onboarded ? "home" : "onboarding")} />;
  if (view.name === "onboarding") return <Onboarding go={go} />;

  const pages = {
    home: <Dashboard go={go} />,
    subject: <SubjectPage go={go} subjectId={view.subjectId} />,
    topic: <TopicPage go={go} subjectId={view.subjectId} topicId={view.topicId} />,
    study: <StudySession go={go} subjectId={view.subjectId} topicId={view.topicId} />,
    notes: <NotesPage go={go} />,
    tasks: <TasksPage go={go} />,
    chat: <AIChatPage />,
    profile: <ProfilePage go={go} />
  };

  return (
    <Shell current={view.name} go={go}>
      {pages[view.name] || pages.home}
    </Shell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router />
      </AppProvider>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
          <section className="max-w-lg rounded-3xl bg-white p-6 text-center shadow-soft">
            <h1 className="text-2xl font-black text-slate-950">StudyBuddy.AI needs a refresh</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The app hit a startup error. Refresh the page first. If it stays here, clear this site's browser data and open it again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              Refresh app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
