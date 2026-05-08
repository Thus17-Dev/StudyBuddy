import { prisma } from "./db.js";

export async function importGuestData(userId, guestData) {
  if (!guestData?.subjects || !Array.isArray(guestData.subjects)) {
    return;
  }

  for (const subject of guestData.subjects) {
    if (!subject?.name) continue;

    const createdSubject = await prisma.subject.create({
      data: {
        userId,
        name: String(subject.name),
        topics: {
          create: (subject.topics || [])
            .filter((topic) => topic?.name)
            .map((topic) => ({
              name: String(topic.name),
              progress: Number.isInteger(topic.progress) ? topic.progress : 0,
              notes: {
                create: (topic.notes || [])
                  .filter((note) => note?.content)
                  .map((note) => ({ content: String(note.content) }))
              },
              flashcards: {
                create: (topic.flashcards || [])
                  .filter((card) => card?.question && card?.answer)
                  .map((card) => ({
                    question: String(card.question),
                    answer: String(card.answer)
                  }))
              }
            }))
        }
      }
    });

    const tasks = (subject.tasks || [])
      .filter((task) => task?.title)
      .map((task) => ({
        subjectId: createdSubject.id,
        title: String(task.title),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        completed: Boolean(task.completed)
      }));

    if (tasks.length) {
      await prisma.task.createMany({ data: tasks });
    }
  }
}
