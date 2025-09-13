import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart3, Moon, Sun, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-[#1f2226] shadow-sm border-b sticky top-0 border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-[#e05b19]" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Finalyze</span>
          </div>
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-[#16191f] hover:bg-gray-200 dark:hover:bg-[#2a2d33] transition-colors duration-200"
            >
              {theme === 'light' ?
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" /> :
                <Sun className="h-5 w-5 text-yellow-400" />
              }
            </button>

            {user && (
              <div className="flex items-center space-x-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.displayName}
                    className="size-[40px] rounded-full ring-2 ring-[#e05b19] ring-offset-2 ring-offset-white dark:ring-offset-[#1f2226]"
                  />
                ) : (
                  <div className="size-[40px] flex items-center justify-center rounded-full bg-[#e05b19] text-white font-semibold text-lg ring-2 ring-[#e05b19] ring-offset-2 ring-offset-white dark:ring-offset-[#1f2226]">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-[#16191f] hover:bg-gray-200 dark:hover:bg-[#2a2d33] transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;