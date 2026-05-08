import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("student123", 12);
  await prisma.user.upsert({
    where: { email: "demo@studybuddy.ai" },
    update: {},
    create: {
      name: "Demo Student",
      email: "demo@studybuddy.ai",
      password,
      subjects: {
        create: [
          {
            name: "Biology",
            topics: {
              create: [
                {
                  name: "Cells",
                  progress: 35,
                  notes: { create: [{ content: "Cells are the basic unit of life." }] },
                  flashcards: {
                    create: [
                      { question: "What is the basic unit of life?", answer: "The cell." }
                    ]
                  }
                }
              ]
            },
            tasks: {
              create: [{ title: "Read chapter 2", dueDate: new Date(), completed: false }]
            }
          }
        ]
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
