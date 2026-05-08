import { Router } from "express";
import OpenAI from "openai";
import { chatSchema, topicToolSchema, validate } from "../validators.js";

export const aiRoutes = Router();

const SYSTEM_PROMPT = `You are StudyBuddy.AI, a smart and friendly study assistant.

Rules:
- Explain topics clearly and simply
- Break complex ideas into steps
- Give examples when possible
- Help students understand, not just give answers
- Generate flashcards (question + answer format) when asked
- Generate summaries and practice questions
- Keep responses structured and easy to read`;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not configured.");
    err.statusCode = 503;
    throw err;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function complete(messages) {
  const provider = process.env.AI_PROVIDER || "auto";

  if (provider === "ollama") {
    return completeWithOllama(messages);
  }

  if (provider === "template") {
    return completeWithTemplate(messages);
  }

  if (provider === "openai" || provider === "auto") {
    try {
      return await completeWithOpenAI(messages);
    } catch (error) {
      if (provider === "openai") {
        throw error;
      }

      try {
        return await completeWithOllama(messages);
      } catch {
        throw error;
      }
    }
  }

  const err = new Error(`Unsupported AI_PROVIDER: ${provider}`);
  err.statusCode = 400;
  throw err;
}

async function completeWithOpenAI(messages) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-5.2",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.4
  });

  return response.choices[0]?.message?.content || "I could not generate an answer right now.";
}

function completeWithTemplate(messages) {
  const latest = [...messages].reverse().find((message) => message.role === "user")?.content || "your topic";
  const simpleAnswer = answerSimpleQuestion(latest);

  if (simpleAnswer) {
    return simpleAnswer;
  }

  return `StudyBuddy.AI free study mode

Topic or question:
${latest}

Simple explanation
${makeSimpleExplanation(latest)}

Example
Think of it like learning a new chapter: first understand the main idea, then remember 2-3 key details.

Quick summary
- Main idea: ${latest.slice(0, 120)}
- Best next step: write 2-3 notes, then turn them into flashcards.

Practice questions
- What is the main idea?
- Can you explain it in your own words?
- What example helps you remember it?

Flashcards
Q: What is the main thing to remember?
A: The core idea of the topic, explained simply.

Q: How should I revise it?
A: Read notes, test yourself, and explain it without looking.`;
}

function answerSimpleQuestion(input) {
  const question = input.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

  if (
    question.includes("president of usa") ||
    question.includes("president of the usa") ||
    question.includes("president of us") ||
    question.includes("president of the us") ||
    question.includes("president of united states") ||
    question.includes("president of the united states")
  ) {
    return `The current president of the United States is Donald J. Trump.

Quick note:
- He is the 47th president.
- He was sworn in on January 20, 2025.

Flashcard
Q: Who is the current president of the United States?
A: Donald J. Trump.`;
  }

  if (question.includes("vice president") && (question.includes("usa") || question.includes("united states") || question.includes("us"))) {
    return `The current vice president of the United States is JD Vance.

Flashcard
Q: Who is the current U.S. vice president?
A: JD Vance.`;
  }

  if (question === "hi" || question === "hello" || question === "hey") {
    return "Hi, I am StudyBuddy.AI. Ask me a study question, or paste notes and I can summarise them, make practice questions, or create flashcards.";
  }

  return "";
}

function makeSimpleExplanation(input) {
  const cleaned = input.replace(/^tell me\s+/i, "").replace(/^explain\s+/i, "").trim();
  if (cleaned.length < 80) {
    return `You asked about "${cleaned}". In free hosted mode, I can help structure your learning, make simple summaries, and create flashcards. For deeper live AI answers, connect OpenAI billing or run Ollama locally.`;
  }
  return "Here is a student-friendly way to study this: identify the main idea, underline key details, then test yourself with short questions.";
}

async function completeWithOllama(messages) {
  const url = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2";
  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`Local AI is not ready. Start Ollama and pull the ${model} model. ${text}`);
    err.statusCode = 503;
    throw err;
  }

  const data = await response.json();
  return data.message?.content || "Local AI did not return an answer.";
}

aiRoutes.post("/chat", async (req, res, next) => {
  try {
    const data = validate(chatSchema, req.body);
    const answer = await complete(data.messages);
    res.json({ answer });
  } catch (error) {
    next(error);
  }
});

aiRoutes.post("/topic-tool", async (req, res, next) => {
  try {
    const data = validate(topicToolSchema, req.body);
    const promptByTool = {
      explain: `Explain this topic clearly in student-friendly steps: ${data.topicName}\n\nContext:\n${data.content}`,
      summarise: `Create a clear study summary for this topic: ${data.topicName}\n\nNotes:\n${data.content}`,
      flashcards: `Generate 6 flashcards for this topic in this exact format:\nQ: question\nA: answer\n\nTopic: ${data.topicName}\nNotes:\n${data.content}`,
      practice: `Generate practice questions with short answers for this topic: ${data.topicName}\n\nNotes:\n${data.content}`
    };

    const answer = await complete([{ role: "user", content: promptByTool[data.tool] }]);
    res.json({ answer });
  } catch (error) {
    next(error);
  }
});
