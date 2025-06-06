import React, { useState, useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// --- 1. Типы данных и Константы ---
export type SortBy = 'votes' | 'newest';
export type Category = 'UI' | 'Performance' | 'Feature' | 'Other';

export interface Feedback {
  id: string;
  text: string;
  votes: number;
  category: Category;
  createdAt: number; // Timestamp
}

const ALL_CATEGORIES: Category[] = ['UI', 'Performance', 'Feature', 'Other'];

// --- 2. Глобальное хранилище Zustand ---
interface FeedbackState {
  feedbacks: Feedback[];
  sortBy: SortBy;
  categoryFilters: Category[]; // Multiple category selection
  isDarkMode: boolean;
  addFeedback: (text: string, category: Category) => void;
  removeFeedback: (id: string) => void;
  voteFeedback: (id: string, type: 'up' | 'down') => void;
  setSortBy: (sort: SortBy) => void;
  toggleCategoryFilter: (category: Category) => void; // For checkboxes
  editFeedback: (id: string, newText: string, newCategory: Category) => void;
  toggleDarkMode: () => void;
  importFeedbacks: (data: Feedback[]) => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  devtools(
    persist(
      (set) => ({
        feedbacks: [],
        sortBy: 'newest',
        categoryFilters: ALL_CATEGORIES,
        isDarkMode: false,

        addFeedback: (text, category) =>
          set((state) => ({
            feedbacks: [
              {
                id: crypto.randomUUID(),
                text,
                votes: 0,
                category,
                createdAt: Date.now(),
              },
              ...state.feedbacks, // Add new feedbacks to the top
            ],
          })),

        removeFeedback: (id) =>
          set((state) => ({
            feedbacks: state.feedbacks.filter((feedback) => feedback.id !== id),
          })),

        voteFeedback: (id, type) =>
          set((state) => ({
            feedbacks: state.feedbacks.map((feedback) =>
              feedback.id === id
                ? { ...feedback, votes: feedback.votes + (type === 'up' ? 1 : -1) }
                : feedback
            ),
          })),

        setSortBy: (sort) => set({ sortBy: sort }),

        toggleCategoryFilter: (category) =>
          set((state) => {
            const currentFilters = state.categoryFilters;
            if (currentFilters.includes(category)) {
              return { categoryFilters: currentFilters.filter((cat) => cat !== category) };
            } else {
              return { categoryFilters: [...currentFilters, category] };
            }
          }),

        editFeedback: (id, newText, newCategory) =>
          set((state) => ({
            feedbacks: state.feedbacks.map((feedback) =>
              feedback.id === id ? { ...feedback, text: newText, category: newCategory } : feedback
            ),
          })),

        toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

        importFeedbacks: (data) => set({ feedbacks: data }),
      }),
      {
        name: 'product-feedback-board-storage',
      }
    )
  )
);

// --- 3. Helper Components ---

// Helper function to get badge classes
const getCategoryBadgeClass = (category: Category) => {
  switch (category) {
    case 'UI': return 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
    case 'Feature': return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
    case 'Performance': return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
    case 'Other': return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    default: return '';
  }
};

// Modal Component
interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}
const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full relative transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-2xl leading-none"
          aria-label="Закрыть"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

// Feedback Add Form
const FeedbackForm: React.FC = () => {
  const addFeedback = useFeedbackStore((state) => state.addFeedback);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Feature');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      addFeedback(feedbackText, selectedCategory);
      setFeedbackText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Добавить новое предложение</h2>
      <textarea
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md mb-3 resize-y bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 outline-none"
        rows={3}
        placeholder="Ваше предложение..."
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
      />
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Категория:</label>
        <select
          id="category"
          className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as Category)}
        >
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
      >
        Добавить
      </button>
    </form>
  );
};

// Feedback List Item
interface FeedbackItemProps {
  feedback: Feedback;
}
const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback }) => {
  const removeFeedback = useFeedbackStore((state) => state.removeFeedback);
  const voteFeedback = useFeedbackStore((state) => state.voteFeedback);
  const editFeedback = useFeedbackStore((state) => state.editFeedback);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(feedback.text);
  const [editCategory, setEditCategory] = useState<Category>(feedback.category);

  const handleEditSave = () => {
    if (editText.trim()) {
      editFeedback(feedback.id, editText, editCategory);
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditText(feedback.text);
    setEditCategory(feedback.category);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-3 transition-colors duration-300">
      <div className="flex-1 mb-2 sm:mb-0">
        <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">{feedback.text}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClass(feedback.category)}`}>
            {feedback.category}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Добавлено: {new Date(feedback.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0 justify-end">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => voteFeedback(feedback.id, 'up')}
            className="text-green-500 hover:text-green-600 font-bold text-xl p-1"
            aria-label="Лайк"
          >
            👍
          </button>
          <span className="text-gray-800 dark:text-gray-200 font-bold text-lg">{feedback.votes}</span>
          <button
            onClick={() => voteFeedback(feedback.id, 'down')}
            className="text-red-500 hover:text-red-600 font-bold text-xl p-1"
            aria-label="Дизлайк"
          >
            👎
          </button>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md"
        >
          Редактировать
        </button>
        <button
          onClick={() => removeFeedback(feedback.id)}
          className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md"
        >
          Удалить
        </button>
      </div>

      {isEditing && (
        <Modal onClose={handleEditCancel}>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Редактировать предложение</h2>
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md mb-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="mb-4">
            <label htmlFor="editCategory" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Категория:</label>
            <select
              id="editCategory"
              className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as Category)}
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleEditCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            >
              Отмена
            </button>
            <button
              onClick={handleEditSave}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            >
              Сохранить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Feedback List (filters and sorts)
const FeedbackList: React.FC = () => {
  const feedbacks = useFeedbackStore((state) => state.feedbacks);
  const sortBy = useFeedbackStore((state) => state.sortBy);
  const categoryFilters = useFeedbackStore((state) => state.categoryFilters);

  const sortedAndFilteredFeedbacks = [...feedbacks]
    .filter((feedback) =>
      // If no filters are selected, show all. Otherwise, only show selected.
      categoryFilters.length === ALL_CATEGORIES.length || categoryFilters.includes(feedback.category)
    )
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      }
      return b.createdAt - a.createdAt; // Sort from newest to oldest
    });

  return (
    <div className="space-y-4">
      {sortedAndFilteredFeedbacks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center text-lg">Пока нет предложений. Добавьте первое!</p>
      ) : (
        sortedAndFilteredFeedbacks.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))
      )}
    </div>
  );
};

// Category Filter Controls
const CategoryFilterControls: React.FC = () => {
  const categoryFilters = useFeedbackStore((state) => state.categoryFilters);
  const toggleCategoryFilter = useFeedbackStore((state) => state.toggleCategoryFilter);

  const allCategoryOptions: Category[] = ALL_CATEGORIES;

  // Function to toggle all categories
  const toggleAllCategories = () => {
    if (categoryFilters.length === ALL_CATEGORIES.length) {
      // If all are selected, unselect all
      ALL_CATEGORIES.forEach(cat => toggleCategoryFilter(cat));
    } else {
      // If not all are selected, select all
      ALL_CATEGORIES.forEach(cat => {
        if (!categoryFilters.includes(cat)) {
          toggleCategoryFilter(cat);
        }
      });
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 transition-colors duration-300">
      <span className="text-gray-700 dark:text-gray-300 font-bold text-sm sm:text-base whitespace-nowrap">Категории:</span>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {/* "All" checkbox */}
        <label className="inline-flex items-center text-gray-700 dark:text-gray-300 text-sm sm:text-base cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 rounded mr-1 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500"
            checked={categoryFilters.length === ALL_CATEGORIES.length}
            onChange={toggleAllCategories}
          />
          Все
        </label>
        {allCategoryOptions.map((cat) => (
          <label key={cat} className="inline-flex items-center text-gray-700 dark:text-gray-300 text-sm sm:text-base cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded mr-1 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500"
              checked={categoryFilters.includes(cat)}
              onChange={() => toggleCategoryFilter(cat)}
            />
            {cat}
          </label>
        ))}
      </div>
    </div>
  );
};

// Experimental Panel for stats and import/export
const ExperimentalPanel: React.FC = () => {
  const feedbacks = useFeedbackStore((state) => state.feedbacks);
  const importFeedbacks = useFeedbackStore((state) => state.importFeedbacks);

  const [showPanel, setShowPanel] = useState(false);

  // Weekly stats
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentFeedbacks = feedbacks.filter(f => f.createdAt > oneWeekAgo);
  const recentVotes = recentFeedbacks.reduce((sum, f) => sum + f.votes, 0);

  const handleExport = () => {
    const dataStr = JSON.stringify(feedbacks, null, 2);
    const downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr);
    downloadLink.download = 'product_feedback_board.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData: Feedback[] = JSON.parse(e.target?.result as string);
          // Add basic validation for imported data
          const isValidData = Array.isArray(importedData) && importedData.every(item =>
            typeof item.id === 'string' &&
            typeof item.text === 'string' &&
            typeof item.votes === 'number' &&
            ALL_CATEGORIES.includes(item.category) &&
            typeof item.createdAt === 'number'
          );

          if (isValidData) {
            importFeedbacks(importedData);
            alert('Данные успешно импортированы!');
          } else {
            alert('Ошибка: Импортированные данные не соответствуют ожидаемому формату.');
          }

        } catch (error) {
          alert('Ошибка при импорте данных: ' + error);
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md mb-4 w-full transition-colors duration-300"
      >
        {showPanel ? 'Скрыть' : 'Показать'} экспериментальную панель
      </button>

      {showPanel && (
        <div className="overflow-hidden">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Статистика за неделю:</h3>
          <p className="text-gray-700 dark:text-gray-300">Новых предложений: {recentFeedbacks.length}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Всего голосов: {recentVotes}</p>

          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Управление данными:</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            >
              Экспорт как JSON
            </button>
            <label className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md cursor-pointer transition-colors duration-300">
              Импорт из JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 4. Main App Component ---
const App: React.FC = () => {
  const feedbacks = useFeedbackStore((state) => state.feedbacks);
  const isDarkMode = useFeedbackStore((state) => state.isDarkMode);
  const toggleDarkMode = useFeedbackStore((state) => state.toggleDarkMode);
  const sortBy = useFeedbackStore((state) => state.sortBy);
  const setSortBy = useFeedbackStore((state) => state.setSortBy);

  const totalFeedbacks = feedbacks.length;

  // Effect to apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <header className="py-4 bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center flex-wrap gap-y-2">
          <h1 className="text-3xl font-bold">Product Feedback Board</h1>
          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
            <span className="text-lg font-semibold whitespace-nowrap">Всего идей: {totalFeedbacks}</span>
            {/* Sort dropdown */}
            <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-white font-bold text-sm sm:text-base whitespace-nowrap">Сортировать по:</label>
                <select
                  id="sort"
                  className="p-2 border border-blue-400 rounded-md bg-blue-700 text-white text-sm sm:text-base focus:ring-blue-300 focus:border-blue-300 outline-none dark:bg-blue-800 dark:border-blue-600"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="newest">Новые</option>
                  <option value="votes">Популярные</option>
                </select>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              title="Переключить тему"
              aria-label="Переключить темную/светлую тему"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <FeedbackForm />
        <CategoryFilterControls />
        <FeedbackList />
        <ExperimentalPanel />
      </main>
    </div>
  );
};

export default App;