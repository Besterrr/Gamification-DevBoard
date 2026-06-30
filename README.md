# DevBoard

Геймифицированный таск-менеджер для личных проектов. Выполняй задачи, получай XP, качай уровень и собирай достижения.

## ✨ Возможности

- **Проекты и задачи** — создание, редактирование, удаление, поиск и фильтрация по статусу/приоритету
- **Геймификация** — система XP и уровней, начисление опыта за выполненные задачи
- **Достижения** — открываемые ачивки за количество выполненных задач и проектов
- **Дедлайны** — установка дедлайнов на задачи с цветовой индикацией срочности
- **Уведомления в реальном времени** — WebSocket-оповещения о приближающихся дедлайнах
- **Аналитика активности** — график выполненных задач и heatmap в стиле GitHub
- **Вложения** — прикрепление файлов к задачам
- **Аватарка пользователя** — загрузка собственного изображения профиля
- **Тёмная/светлая тема** — переключение с сохранением выбора

## 🛠 Стек

**Frontend**
- React + Vite
- React Router
- Axios
- Socket.io Client
- Recharts
- SCSS (BEM)

**Backend**
- Node.js + Express
- PostgreSQL (Neon)
- node-postgres
- Socket.io
- JWT (access + refresh токены)
- Multer (загрузка файлов)
- node-pg-migrate

## 📦 Структура проекта

```
my_project/
├── client/          # React-фронтенд
│   └── src/
│       ├── api/         # axios-клиент, перехватчики
│       ├── components/  # переиспользуемые компоненты
│       ├── context/      # AuthContext
│       ├── hooks/        # useAuth, useDarkMode
│       └── pages/        # страницы приложения
└── server/          # Express-бэкенд
    └── src/
        ├── controllers/
        ├── middleware/
        ├── routes/
        ├── services/
        └── config/
    └── migrations/   # миграции БД
```

## 🚀 Запуск локально

### Бэкенд

```bash
cd server
npm install
```

Создай `.env`:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=5000
```

Накати миграции и запусти сервер:
```bash
npm run migrate:up
npm run dev
```

### Фронтенд

```bash
cd client
npm install
```

Создай `.env.development`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

## 🗄 Схема базы данных

```
users             → id, email, password_hash, username, xp, level, avatar_url, created_at
projects          → id, user_id, title, description, status, created_at
tasks             → id, project_id, title, description, status, priority, deadline, xp_reward, completed_at, created_at
refresh_tokens    → id, user_id, token, expires_at, created_at
achievements      → id, key, title, description, icon, xp_bonus
user_achievements → id, user_id, achievement_id, earned_at
task_attachments  → id, task_id, filename, original_name, mimetype, size, created_at
```

## 🌐 Деплой

- **Frontend** — Vercel
- **Backend** — Railway
- **Database** — Neon (PostgreSQL)

## 📄 Лицензия

MIT
