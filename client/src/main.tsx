import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme on app load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('financeTracker_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
);
