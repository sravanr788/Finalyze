import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './components/Landing';
import { BrowserRouter, Routes , Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { Toaster } from 'sonner';
import LoadingSpinner from './components/ui/LoadingSpinner';

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>(() => 
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Listen for theme changes
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setCurrentTheme(isDarkNow ? 'dark' : 'light');
        }
      });
    });

    // Start observing the documentElement for attribute changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Initial check
    // Cleanup
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16191f] flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
    <Toaster 
      position="top-center" 
      duration={5000}
      theme={currentTheme}
      toastOptions={{
        classNames: {
          toast: '!border !border-gray-200 dark:!border-gray-700',
          title: '!font-semibold',
          description: '!text-sm',
          success: '!bg-green-50 !text-green-800 dark:!bg-green-900/30 dark:!text-green-100',
          error: '!bg-red-50 !text-red-800 dark:!bg-red-900/30 dark:!text-red-100',
          info: '!bg-blue-50 !text-blue-800 dark:!bg-blue-900/30 dark:!text-blue-100',
          warning: '!bg-yellow-50 !text-yellow-800 dark:!bg-yellow-900/30 dark:!text-yellow-100',
        }
      }}
    />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;