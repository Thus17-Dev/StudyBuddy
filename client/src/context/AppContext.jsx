import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../lib/api";
import {
  averageProgress,
  clearGuestData,
  emptyGuestData,
  loadGuestData,
  makeId,
  normalizeSubject,
  saveGuestData
} from "../lib/guestStore";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("studybuddy.token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("studybuddy.user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("studybuddy.user");
      localStorage.removeItem("studybuddy.token");
      return null;
    }
  });
  const [guestData, setGuestData] = useState(loadGuestData);
  const [subjects, setSubjects] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("studybuddy.theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("studybuddy.language") || "English");

  const isGuest = !token;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("studybuddy.theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("studybuddy.language", language);
  }, [language]);

  useEffect(() => {
    if (!isGuest) {
      refreshSubjects();
    }
  }, [token]);

  useEffect(() => {
    if (isGuest) {
      const normalized = guestData.subjects.map(normalizeSubject);
      setSubjects(normalized);
      saveGuestData({ ...guestData, subjects: normalized });
    }
  }, [guestData, isGuest]);

  function updateGuest(mutator) {
    setGuestData((current) => {
      const next = mutator(structuredClone(current));
      saveGuestData(next);
      return next;
    });
  }

  async function refreshSubjects() {
    if (!token) return;
    setBusy(true);
    try {
      const data = await request("/subjects", { token });
      setSubjects(data.map(normalizeSubject));
    } finally {
      setBusy(false);
    }
  }

  async function continueAsGuest(level = "High School", selectedSubjects = ["Math", "Science"], selectedGrade = "") {
    updateGuest((data) => {
      data.selectedLevel = level;
      data.selectedGrade = selectedGrade;
      data.onboardingDone = true;
      if (!data.subjects.length) {
        data.subjects = selectedSubjects.map((name) => ({
          id: makeId("subject"),
          name,
          topics: [],
          tasks: [],
          progress: 0
        }));
      }
      return data;
    });
  }

  async function signup(payload) {
    setBusy(true);
    setError("");
    try {
      const body = isGuest ? { ...payload, guestData } : payload;
      const data = await request(isGuest ? "/auth/upgrade" : "/auth/signup", {
        method: "POST",
        body: JSON.stringify(body)
      });
      localStorage.setItem("studybuddy.token", data.token);
      localStorage.setItem("studybuddy.user", JSON.stringify(data.user));
      clearGuestData();
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function login(payload) {
    setBusy(true);
    setError("");
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localStorage.setItem("studybuddy.token", data.token);
      localStorage.setItem("studybuddy.user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    if (isGuest) {
      clearGuestData();
      setGuestData(emptyGuestData());
      setSubjects([]);
      return;
    }
    localStorage.removeItem("studybuddy.token");
    localStorage.removeItem("studybuddy.user");
    setToken(null);
    setUser(null);
    setGuestData(loadGuestData());
  }

  async function createSubject(name) {
    if (isGuest) {
      const subject = { id: makeId("subject"), name, topics: [], tasks: [], progress: 0 };
      updateGuest((data) => {
        data.subjects.unshift(subject);
        return data;
      });
      return subject;
    }
    const subject = await request("/subjects", { token, method: "POST", body: JSON.stringify({ name }) });
    await refreshSubjects();
    return subject;
  }

  async function createTopic(subjectId, name) {
    if (isGuest) {
      const topic = { id: makeId("topic"), subjectId, name, progress: 0, notes: [], flashcards: [] };
      updateGuest((data) => {
        const subject = data.subjects.find((item) => item.id === subjectId);
        subject.topics.push(topic);
        subject.progress = averageProgress(subject.topics);
        return data;
      });
      return topic;
    }
    const topic = await request(`/subjects/${subjectId}/topics`, { token, method: "POST", body: JSON.stringify({ name }) });
    await refreshSubjects();
    return topic;
  }

  async function createNote(topicId, content) {
    if (isGuest) {
      updateGuest((data) => {
        const topic = findTopic(data.subjects, topicId);
        topic.notes ||= [];
        topic.notes.unshift({ id: makeId("note"), topicId, content });
        return data;
      });
      return;
    }
    await request(`/topics/${topicId}/notes`, { token, method: "POST", body: JSON.stringify({ content }) });
    await refreshSubjects();
  }

  async function updateNote(topicId, noteId, content) {
    if (isGuest) {
      updateGuest((data) => {
        const topic = findTopic(data.subjects, topicId);
        topic.notes ||= [];
        const note = topic.notes.find((item) => item.id === noteId);
        if (note) note.content = content;
        return data;
      });
      return;
    }
    await request(`/topics/${topicId}/notes/${noteId}`, { token, method: "PUT", body: JSON.stringify({ content }) });
    await refreshSubjects();
  }

  async function createFlashcard(topicId, question, answer) {
    if (isGuest) {
      updateGuest((data) => {
        const topic = findTopic(data.subjects, topicId);
        topic.flashcards ||= [];
        topic.flashcards.unshift({ id: makeId("flashcard"), topicId, question, answer });
        return data;
      });
      return;
    }
    await request(`/topics/${topicId}/flashcards`, {
      token,
      method: "POST",
      body: JSON.stringify({ question, answer })
    });
    await refreshSubjects();
  }

  async function updateProgress(topicId, progress) {
    if (isGuest) {
      updateGuest((data) => {
        for (const subject of data.subjects) {
          const topic = subject.topics.find((item) => item.id === topicId);
          if (topic) {
            topic.progress = Math.max(topic.progress || 0, progress);
            subject.progress = averageProgress(subject.topics);
          }
        }
        return data;
      });
      return;
    }
    await request(`/topics/${topicId}/progress`, { token, method: "PATCH", body: JSON.stringify({ progress }) });
    await refreshSubjects();
  }

  async function createTask(subjectId, title, dueDate) {
    if (isGuest) {
      updateGuest((data) => {
        const subject = data.subjects.find((item) => item.id === subjectId);
        subject.tasks ||= [];
        subject.tasks.unshift({ id: makeId("task"), subjectId, title, dueDate, completed: false });
        return data;
      });
      return;
    }
    await request(`/subjects/${subjectId}/tasks`, {
      token,
      method: "POST",
      body: JSON.stringify({ title, dueDate })
    });
    await refreshSubjects();
  }

  async function toggleTask(taskId, completed) {
    if (isGuest) {
      updateGuest((data) => {
        for (const subject of data.subjects) {
          subject.tasks ||= [];
          const task = subject.tasks.find((item) => item.id === taskId);
          if (task) task.completed = completed;
        }
        return data;
      });
      return;
    }
    await request(`/tasks/${taskId}`, { token, method: "PATCH", body: JSON.stringify({ completed }) });
    await refreshSubjects();
  }

  async function askAI(messages) {
    try {
      const localizedMessages = messages.map((message, index) => {
        if (index === messages.length - 1 && message.role === "user" && language !== "English") {
          return { ...message, content: `Please answer in ${language}. ${message.content}` };
        }
        return message;
      });
      return await request("/ai/chat", { method: "POST", body: JSON.stringify({ messages: localizedMessages }) });
    } catch (error) {
      return {
        answer: `AI could not answer yet: ${error.message}`
      };
    }
  }

  async function runTopicTool(tool, topic) {
    const content = [
      ...(topic.notes || []).map((note) => note.content),
      ...(topic.flashcards || []).map((card) => `Q: ${card.question}\nA: ${card.answer}`)
    ].join("\n\n");

    try {
      return await request("/ai/topic-tool", {
        method: "POST",
        body: JSON.stringify({ tool, topicName: topic.name, content })
      });
    } catch (error) {
      return {
        answer: `${localStudyResponse(tool, topic, content)}\n\nAI status: ${error.message}`
      };
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isGuest,
      guestData,
      subjects,
      busy,
      error,
      continueAsGuest,
      signup,
      login,
      logout,
      createSubject,
      createTopic,
      createNote,
      updateNote,
      createFlashcard,
      updateProgress,
      createTask,
      toggleTask,
      askAI,
      runTopicTool,
      refreshSubjects,
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      language,
      setLanguage
    }),
    [token, user, isGuest, guestData, subjects, busy, error, theme, language]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useStudyBuddy() {
  return useContext(AppContext);
}

function findTopic(subjects, topicId) {
  for (const subject of subjects) {
    const topic = subject.topics.find((item) => item.id === topicId);
    if (topic) return topic;
  }
  throw new Error("Topic not found");
}

function localStudyResponse(tool, topic, content) {
  const topicName = topic?.name || "this topic";
  if (tool === "flashcards") {
    const facts = content
      .split(/[.\n]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 8)
      .slice(0, 6);

    const cards = facts.length
      ? facts.map((fact, index) => `Q: What should you remember about ${topicName} #${index + 1}?\nA: ${fact}`)
      : [
          `Q: What is ${topicName} about?\nA: It is the topic you are studying. Add notes for better flashcards.`,
          `Q: How should you revise ${topicName}?\nA: Read your notes, test yourself, and explain the idea in your own words.`
        ];
    return cards.join("\n\n");
  }

  if (tool === "summarise") {
    return `Summary for ${topicName}\n\n- Main idea: ${content || "Add notes so StudyBuddy can summarise them."}\n- Next step: turn the most important points into flashcards.`;
  }

  if (tool === "practice") {
    return `Practice questions for ${topicName}\n\n1. What is the main idea of ${topicName}?\n2. Can you explain it in your own words?\n3. What example helps you remember it?`;
  }

  return `Explanation for ${topicName}\n\n1. Start with the main idea.\n2. Break it into smaller parts.\n3. Connect each part to an example.\n\nAdd your OpenAI API key in server/.env to get full AI explanations.`;
}

