import { prisma } from "./db.js";

export async function assertSubjectOwner(subjectId, userId) {
  const subject = await prisma.subject.findFirst({
    where: { id: Number(subjectId), userId }
  });
  if (!subject) {
    const err = new Error("Subject not found.");
    err.statusCode = 404;
    throw err;
  }
  return subject;
}

export async function assertTopicOwner(topicId, userId) {
  const topic = await prisma.topic.findFirst({
    where: {
      id: Number(topicId),
      subject: { userId }
    },
    include: { subject: true }
  });
  if (!topic) {
    const err = new Error("Topic not found.");
    err.statusCode = 404;
    throw err;
  }
  return topic;
}

export async function updateSubjectProgress(subjectId) {
  const topics = await prisma.topic.findMany({
    where: { subjectId: Number(subjectId) },
    select: { progress: true }
  });

  if (topics.length === 0) {
    return 0;
  }

  return Math.round(
    topics.reduce((sum, topic) => sum + topic.progress, 0) / topics.length
  );
}
