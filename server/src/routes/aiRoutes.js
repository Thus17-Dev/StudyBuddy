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

  return `StudyBuddy.AI free study mode

Topic or question:
${latest}

1. Simple explanation
Start with the main idea. Break it into smaller parts. Then connect each part to an example.

2. Example
Use this sentence: "This means ___, and one example is ___."

3. Quick summary
- Main idea: ${latest.slice(0, 120)}
- Best next step: write 2-3 notes, then turn them into flashcards.

4. Practice questions
- What is the main idea?
- Can you explain it in your own words?
- What example helps you remember it?

5. Flashcards
Q: What is the main thing to remember?
A: The core idea of the topic, explained simply.

Q: How should I revise it?
A: Read notes, test yourself, and explain it without looking.`;
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
