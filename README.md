# StudyBuddy.AI

StudyBuddy.AI is a production-ready full-stack study assistant for students. It supports guest-first usage, JWT accounts, topic-scoped notes and flashcards, task tracking, and OpenAI-powered study help.

## Stack

- Frontend: React, hooks, context, Tailwind CSS, Vite
- Backend: Node.js, Express
- Database: SQLite with Prisma
- Auth: JWT with bcrypt password hashing
- AI: OpenAI API, default model `gpt-5.2`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `server/.env`:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-5.2"
AI_PROVIDER="auto"
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

3. Create the database:

```bash
npm run db:generate
npm run db:migrate
```

4. Start the app:

```bash
npm run dev
```

Frontend: http://localhost:5173

Backend API: http://localhost:4000/api

## Guest Mode

Students can click **Continue as Guest** and use subjects, topics, notes, tasks, AI chat, summaries, explanations, and flashcards without an account. Guest data is stored in browser local storage.

When a guest signs up, the app sends the local guest study graph to `/api/auth/upgrade` and preserves all progress in the account.

## Free Local AI Option

If you cannot use paid OpenAI API billing, install Ollama and run a local model:

```bash
ollama pull llama3.2
ollama serve
```

Then set this in `server/.env`:

```env
AI_PROVIDER="ollama"
OLLAMA_MODEL="llama3.2"
OLLAMA_URL="http://localhost:11434"
```

Restart the app with `npm run dev`. The backend will use local AI through Ollama.

## Free Public Hosting

For a first free public version, deploy the whole app to Render using `render.yaml`.

Public demo settings:

```env
NODE_ENV="production"
DATABASE_URL="file:./dev.db"
AI_PROVIDER="template"
```

`AI_PROVIDER="template"` keeps the hosted demo free. It gives structured study help without paid OpenAI billing or local Ollama.

Render setup:

1. Push this project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Use:

```bash
npm install && npm run db:generate && npm run build
```

as the build command.

4. Use:

```bash
npm run deploy:start
```

as the start command.

5. Open the Render URL, usually like:

```text
https://studybuddy-ai.onrender.com
```

SQLite on free hosting is okay for a demo. For a serious public app, switch to hosted PostgreSQL.

## Data Boundaries

The backend enforces ownership and relationships:

- Subjects always belong to a user.
- Topics always belong to a subject.
- Notes and flashcards are always filtered by `topic_id`.
- Tasks always belong to a subject.
- Topic progress updates through `/api/topics/:id/progress`.

## API Highlights

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/upgrade`
- `GET/POST /api/subjects`
- `GET/POST /api/subjects/:subjectId/topics`
- `GET/POST /api/topics/:topicId/notes`
- `GET/POST /api/topics/:topicId/flashcards`
- `GET/POST /api/subjects/:subjectId/tasks`
- `POST /api/ai/chat`
- `POST /api/ai/topic-tool`
