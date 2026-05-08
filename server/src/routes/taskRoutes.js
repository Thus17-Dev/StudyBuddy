import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../auth.js";
import { assertSubjectOwner } from "../ownership.js";
import { taskSchema, validate } from "../validators.js";

export const taskRoutes = Router();
taskRoutes.use(requireAuth);

taskRoutes.patch("/:taskId", async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: Number(req.params.taskId), subject: { userId: req.user.id } }
    });
    if (!task) return res.status(404).json({ message: "Task not found." });

    const data = validate(taskSchema.partial(), req.body);
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        title: data.title ?? task.title,
        dueDate: data.dueDate === undefined ? task.dueDate : data.dueDate ? new Date(data.dueDate) : null,
        completed: data.completed ?? task.completed
      }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

taskRoutes.delete("/:taskId", async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: Number(req.params.taskId), subject: { userId: req.user.id } }
    });
    if (!task) return res.status(404).json({ message: "Task not found." });
    await assertSubjectOwner(task.subjectId, req.user.id);
    await prisma.task.delete({ where: { id: task.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
