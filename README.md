# Ziptra

Ziptra is a small, local-first kanban board for people and AI agents.
It uses React for the interface and SQLite for local storage.

## Features

- Separate project and task boards.
- Project lanes for New, Active, and Closed.
- Task lanes for New, Explore, Build, Validate, and Closed.
- Drag-and-drop status updates.
- Project, task, and comment creation, editing, and deletion.
- Markdown descriptions and comments.
- Image upload and clipboard image paste in Markdown editors.
- Search by title or ID and task filtering by project.
- URL-addressable project and task detail drawers.
- Project deletion preserves its tasks as standalone tasks.

## Development

Install dependencies in both applications:

```sh
cd backend
npm install
cd ../frontend
npm install
```

Initialize a new local database if `backend/ziptra.db` does not exist:

```sh
cd backend
npx drizzle-kit migrate
```

Start the API from `backend/`:

```sh
npm run dev
```

Start the interface from `frontend/` in another terminal:

```sh
npm run dev
```

Open `http://localhost:5173`.
The Vite development server proxies `/api` and `/uploads` to the API at `http://localhost:3000`.

Uploaded images are stored in `backend/uploads/` and referenced from Markdown using local `/uploads/...` paths.
PNG, JPEG, GIF, and WebP images up to 10 MiB are supported.

## Tests and checks

```sh
cd backend
npm test

cd ../frontend
npm run lint
npm run build
```

## Product direction

Ziptra is intended to become a low-cost coordination layer for AI coding agents.
Future agent tooling should make it easy to inspect and filter the board, move and close cards, create work, and comment on cards without exceeding large context budgets.
