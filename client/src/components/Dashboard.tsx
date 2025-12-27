import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';
import { getTransactions } from '../utils/storage';
import Header from './Header';
import TransactionEntry from './TransactionEntry';
import TransactionList from './TransactionList';
import Analytics from './Analytics';
import SummaryCards from './SummaryCards';
import { toast } from 'sonner';
import LoadingSpinner from './ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');


  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const userTransactions = await getTransactions(user.id);
        setTransactions(userTransactions);
        if (userTransactions.length === 0) {
          toast.info('No transactions found. Add your first transaction to get started!');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions. Please refresh the page to try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const refreshTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userTransactions = await getTransactions(user.id);
      setTransactions(userTransactions);
      toast.success('Transactions refreshed successfully');
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      toast.error('Failed to refresh transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16191f] flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Loading your transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16191f] transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <TransactionEntry onTransactionAdded={refreshTransactions} />
        </div>

        <div className="mb-6">
          <nav className="flex space-x-1 bg-white dark:bg-[#1f2226] rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'transactions', label: 'Transactions' },
              { key: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === tab.key
                    ? 'bg-[#e05b19] text-white shadow-md scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2d33]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <SummaryCards transactions={transactions} />
              <div className="grid lg:grid-cols-2 gap-6">
                <Analytics transactions={transactions} />
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onTransactionUpdated={refreshTransactions}
                  showViewAll
                  setActiveTab={setActiveTab}
                />
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              onTransactionUpdated={refreshTransactions}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard