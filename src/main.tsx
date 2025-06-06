import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Важно: здесь импортируются наши стили, включая Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);