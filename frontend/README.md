# Mini Case Tracker — Frontend

React + TypeScript + Vite + Tailwind CSS + Material UI + Redux Toolkit (persisted) + React Router.

## Quick start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Ensure the backend is running at `http://localhost:5000`.

## Tech stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (utility classes alongside MUI)
- **MUI** — components, layout, theme
- **Redux Toolkit** + **redux-persist** — auth & list filters persisted
- **React Router v7** — protected & role-based routes
- **Axios** — API client with JWT interceptor
- **react-hot-toast** — notifications
- **Error Boundary** — global crash handling

## Folder structure

```
src/
├── assets/
├── components/common/   # ErrorBoundary, StatusChip, ProtectedRoute, etc.
├── constants/
├── data/
├── doc/
├── hooks/api/           # Custom hooks per REST resource
├── interfaces/
├── layouts/             # AuthLayout, MainLayout
├── pages/               # Feature-based pages
│   ├── auth/login/
│   ├── dashboard/
│   └── cases/
│       ├── list/
│       ├── detail/
│       └── create/
├── redux/
├── routes/
├── types/
└── utils/
```

## Demo login

| Role    | Email                 | Password     |
|---------|-----------------------|--------------|
| Manager | manager@minicase.com  | password123  |
| Agent   | agent@minicase.com    | password123  |

## Environment

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` |
| `VITE_UPLOAD_BASE_URL` | `http://localhost:5000` |
