const STORAGE_KEY = "studybuddy.guest";

export function makeId(prefix) {
  const randomId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  return `${prefix}_${randomId}`;
}

export function emptyGuestData() {
  return {
    subjects: [],
    chats: [],
    selectedLevel: "",
    onboardingDone: false,
    streak: 1,
    achievements: ["Started learning"]
  };
}

export function loadGuestData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyGuestData();
  try {
    return { ...emptyGuestData(), ...JSON.parse(raw) };
  } catch {
    return emptyGuestData();
  }
}

export function saveGuestData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearGuestData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function normalizeSubject(subject) {
  const topics = (subject.topics || []).map(normalizeTopic);
  return {
    ...subject,
    topics,
    tasks: subject.tasks || [],
    progress: subject.progress ?? averageProgress(topics)
  };
}

export function normalizeTopic(topic) {
  return {
    ...topic,
    progress: topic.progress || 0,
    notes: topic.notes || [],
    flashcards: topic.flashcards || []
  };
}

export function averageProgress(topics) {
  if (!topics.length) return 0;
  return Math.round(topics.reduce((sum, topic) => sum + (topic.progress || 0), 0) / topics.length);
}

export function parseFlashcards(text) {
  const cards = [];
  const blocks = text.split(/\n\s*\n/);

  for (const block of blocks) {
    const question = block.match(/Q:\s*(.+)/i)?.[1]?.trim();
    const answer = block.match(/A:\s*(.+)/i)?.[1]?.trim();
    if (question && answer) cards.push({ question, answer });
  }

  if (cards.length) return cards;

  const lines = text.split("\n").filter(Boolean);
  for (let index = 0; index < lines.length - 1; index += 2) {
    cards.push({
      question: lines[index].replace(/^[-*\d. ]+/, "").trim(),
      answer: lines[index + 1].replace(/^[-*\d. ]+/, "").trim()
    });
  }
  return cards.filter((card) => card.question && card.answer);
}
