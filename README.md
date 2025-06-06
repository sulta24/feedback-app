# 📝 Product Feedback Board

Product Feedback Board — одностраничное приложение (SPA) для сбора и оценки пользовательских предложений. Пользователи могут добавлять идеи, голосовать, фильтровать по категориям и сортировать по дате или популярности. Поддерживается светлая/тёмная тема и сохранение данных в `localStorage`.

---

## ✨ Возможности

- 📝 Добавление предложений с категорией  
- 👍 Голосование (лайк/дизлайк)  
- 🧹 Удаление и ✏️ редактирование идей  
- 🗂 Фильтрация: `UI`, `Performance`, `Feature`, `Other`  
- 🔀 Сортировка по дате или популярности  
- 🌗 Светлая/тёмная тема  
- 💾 Сохранение состояния (`localStorage`)  
- 🌀 Анимации (`framer-motion`)  
- 📤📥 Экспорт / Импорт данных (JSON)  

---

## 🚀 Стек технологий

- **React + TypeScript**
- **Zustand** с middleware (`persist`, `devtools`)
- **Tailwind CSS**
- **Vite**

---

## 🛠️ Установка и запуск

```bash
git clone https://github.com/your-username/product-feedback-board.git
cd product-feedback-board
npm install
npm run dev


🗂 Структура проекта
bash
Копировать
Редактировать
src/
├── App.tsx                  # Главный компонент
├── store/                   # Zustand store
├── components/              # Компоненты UI
├── types.ts                 # Типы данных
└── constants.ts             # Константы (категории и пр.)
