import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../auth.js";
import { assertSubjectOwner, updateSubjectProgress } from "../ownership.js";
import { subjectSchema, taskSchema, topicSchema, validate } from "../validators.js";

export const subjectRoutes = Router();
subjectRoutes.use(requireAuth);

subjectRoutes.get("/", async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.user.id },
      include: {
        topics: {
          include: {
            notes: true,
            flashcards: true
          }
        },
        tasks: true
      },
      orderBy: { updatedAt: "desc" }
    });

    const withProgress = await Promise.all(
      subjects.map(async (subject) => ({
        ...subject,
        progress: await updateSubjectProgress(subject.id)
      }))
    );

    res.json(withProgress);
  } catch (error) {
    next(error);
  }
});

subjectRoutes.post("/", async (req, res, next) => {
  try {
    const data = validate(subjectSchema, req.body);
    const subject = await prisma.subject.create({
      data: { name: data.name, userId: req.user.id },
      include: { topics: true, tasks: true }
    });
    res.status(201).json({ ...subject, progress: 0 });
  } catch (error) {
    next(error);
  }
});

subjectRoutes.get("/:subjectId", async (req, res, next) => {
  try {
    await assertSubjectOwner(req.params.subjectId, req.user.id);
    const subject = await prisma.subject.findUnique({
      where: { id: Number(req.params.subjectId) },
      include: {
        topics: { include: { notes: true, flashcards: true } },
        tasks: true
      }
    });
    res.json({ ...subject, progress: await updateSubjectProgress(subject.id) });
  } catch (error) {
    next(error);
  }
});

subjectRoutes.post("/:subjectId/topics", async (req, res, next) => {
  try {
    const subject = await assertSubjectOwner(req.params.subjectId, req.user.id);
    const data = validate(topicSchema, req.body);
    const topic = await prisma.topic.create({
      data: { name: data.name, subjectId: subject.id },
      include: { notes: true, flashcards: true }
    });
    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
});

subjectRoutes.post("/:subjectId/tasks", async (req, res, next) => {
  try {
    const subject = await assertSubjectOwner(req.params.subjectId, req.user.id);
    const data = validate(taskSchema, req.body);
    const task = await prisma.task.create({
      data: {
        subjectId: subject.id,
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completed: data.completed ?? false
      }
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});
