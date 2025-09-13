import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './components/Landing';
import { BrowserRouter, Routes , Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16191f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e05b19] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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