import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { format, subDays, startOfDay } from 'date-fns';
import LoadingSpinner from './ui/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Props {
  transactions: Transaction[];
}

const Analytics: React.FC<Props> = ({ transactions }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    categoryData: Record<string, number>;
    timeData: { labels: string[]; amounts: number[] };
  } | null>(null);

  useEffect(() => {
    const processData = () => {
      try {
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Category spending data
        const categoryData = expenses.reduce((acc, transaction) => {
          acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
          return acc;
        }, {} as Record<string, number>);

        // Time-based data (last 7 days)
        const today = startOfDay(new Date());
        const timeData = {
          labels: Array(7).fill(0).map((_, i) => {
            const date = subDays(today, 6 - i);
            return format(date, 'EEE');
          }),
          amounts: Array(7).fill(0)
        };

        expenses.forEach(transaction => {
          const date = new Date(transaction.date);
          const diffInDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (diffInDays >= 0 && diffInDays < 7) {
            timeData.amounts[6 - diffInDays] += transaction.amount;
          }
        });

        setChartData({ categoryData, timeData });
        setError(null);
      } catch (err) {
        console.error('Error processing analytics data:', err);
        setError('Failed to process analytics data');
        toast.error('Failed to load analytics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    processData();
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <p>Failed to load analytics data.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-[#e05b19] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const { categoryData } = chartData;

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#e05b19',
          '#8b5cf6',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#6366f1',
          '#ec4899'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Daily spending trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const dayExpenses = transactions
      .filter((t: Transaction) => t.type === 'expense' && startOfDay(new Date(t.date)).getTime() === date.getTime())
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    return {
      date,
      amount: dayExpenses
    };
  });

  const lineData = {
    labels: last7Days.map(day => format(day.date, 'MMM dd')),
    datasets: [
      {
        label: 'Daily Spending',
        data: last7Days.map(day => day.amount),
        borderColor: '#e05b19',
        backgroundColor: 'rgba(224, 91, 25, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e05b19',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1f2226] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spending by Category
        </h3>
        <div className="h-64">
          {Object.keys(categoryData).length > 0 ? (
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No expense data available
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f2226] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          7-Day Spending Trend
        </h3>
        <div className="h-64">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;