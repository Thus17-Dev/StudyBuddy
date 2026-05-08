import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  guestData: z.any().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const subjectSchema = z.object({
  name: z.string().min(1).max(80)
});

export const topicSchema = z.object({
  name: z.string().min(1).max(100)
});

export const progressSchema = z.object({
  progress: z.number().int().min(0).max(100)
});

export const noteSchema = z.object({
  content: z.string().min(1)
});

export const flashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1)
});

export const taskSchema = z.object({
  title: z.string().min(1).max(160),
  dueDate: z.string().optional().nullable(),
  completed: z.boolean().optional()
});

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1)
    })
  ).min(1)
});

export const topicToolSchema = z.object({
  tool: z.enum(["explain", "summarise", "flashcards", "practice"]),
  topicName: z.string().min(1),
  content: z.string().optional().default("")
});

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((error) => error.message).join(", ");
    const err = new Error(message);
    err.statusCode = 400;
    throw err;
  }
  return result.data;
}
