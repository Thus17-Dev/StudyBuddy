import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../auth.js";
import { assertTopicOwner } from "../ownership.js";
import { flashcardSchema, noteSchema, progressSchema, validate } from "../validators.js";

export const topicRoutes = Router();
topicRoutes.use(requireAuth);

topicRoutes.get("/:topicId", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const topic = await prisma.topic.findUnique({
      where: { id: Number(req.params.topicId) },
      include: { notes: true, flashcards: true }
    });
    res.json(topic);
  } catch (error) {
    next(error);
  }
});

topicRoutes.patch("/:topicId/progress", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const data = validate(progressSchema, req.body);
    const topic = await prisma.topic.update({
      where: { id: Number(req.params.topicId) },
      data: { progress: data.progress },
      include: { notes: true, flashcards: true }
    });
    res.json(topic);
  } catch (error) {
    next(error);
  }
});

topicRoutes.get("/:topicId/notes", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const notes = await prisma.note.findMany({
      where: { topicId: Number(req.params.topicId) },
      orderBy: { updatedAt: "desc" }
    });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

topicRoutes.post("/:topicId/notes", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const data = validate(noteSchema, req.body);
    const note = await prisma.note.create({
      data: { topicId: Number(req.params.topicId), content: data.content }
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

topicRoutes.put("/:topicId/notes/:noteId", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const data = validate(noteSchema, req.body);
    const existing = await prisma.note.findFirst({
      where: {
        id: Number(req.params.noteId),
        topicId: Number(req.params.topicId)
      }
    });
    if (!existing) {
      return res.status(404).json({ message: "Note not found." });
    }
    const note = await prisma.note.update({
      where: { id: existing.id },
      data: { content: data.content }
    });
    res.json(note);
  } catch (error) {
    next(error);
  }
});

topicRoutes.get("/:topicId/flashcards", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const flashcards = await prisma.flashcard.findMany({
      where: { topicId: Number(req.params.topicId) },
      orderBy: { createdAt: "desc" }
    });
    res.json(flashcards);
  } catch (error) {
    next(error);
  }
});

topicRoutes.post("/:topicId/flashcards", async (req, res, next) => {
  try {
    await assertTopicOwner(req.params.topicId, req.user.id);
    const data = validate(flashcardSchema, req.body);
    const flashcard = await prisma.flashcard.create({
      data: {
        topicId: Number(req.params.topicId),
        question: data.question,
        answer: data.answer
      }
    });
    res.status(201).json(flashcard);
  } catch (error) {
    next(error);
  }
});
