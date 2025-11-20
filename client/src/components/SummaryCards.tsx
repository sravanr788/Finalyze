import React from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Props {
  transactions: Transaction[];
}

const SummaryCards: React.FC<Props> = ({ transactions = [] }) => {
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyTransactions = transactions.filter(t => {
    // Handle both string and Date types for the date field
    const transactionDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
    return transactionDate && !isNaN(transactionDate.getTime()) && 
           transactionDate >= monthStart && 
           transactionDate <= monthEnd;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  const cards = [
    {
      title: 'Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      prefix: '+₹'
    },
    {
      title: 'Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      prefix: '-₹'
    },
    {
      title: 'Net Savings',
      value: savings,
      icon: PiggyBank,
      color: savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: savings >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
      prefix: savings >= 0 ? '+₹' : '-₹'
    },
    {
      title: 'Transactions',
      value: monthlyTransactions.length,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      prefix: ''
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-[#1f2226] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.prefix}{Math.abs(card.value).toFixed(card.title === 'Transactions' ? 0 : 2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
