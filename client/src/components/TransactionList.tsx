import React, { useState, useEffect } from "react";
import { Transaction } from "../types";
import { Edit2, Trash2, ArrowRight, Filter, X, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import EditModal from "./EditModal";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subDays } from 'date-fns';

interface Props {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
  showViewAll?: boolean;
  setActiveTab?: (tab: "overview" | "transactions" | "analytics") => void;
}

type FilterType = 'all' | 'thisMonth' | 'last30Days' | 'custom' | 'byMonth';

const TransactionList: React.FC<Props> = ({
  transactions,
  onTransactionUpdated,
  showViewAll,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense",
    date: "",
  });

  // Advanced filtering states
  const [filterType, setFilterType] = useState<FilterType>('thisMonth');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [filteredByDate, setFilteredByDate] = useState<Transaction[]>(transactions);

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Generate list of available months from transactions
  const availableMonths = Array.from(
    new Set(
      transactions.map(t => format(new Date(t.date), 'yyyy-MM'))
    )
  ).sort().reverse();

  // Apply date filter
  useEffect(() => {
    let filtered: Transaction[] = [];

    switch (filterType) {
      case 'all':
        filtered = transactions;
        break;

      case 'thisMonth': {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        filtered = transactions.filter(t => {
          const date = new Date(t.date);
          return isWithinInterval(date, { start, end });
        });
        break;
      }

      case 'last30Days': {
        const now = new Date();
        const start = subDays(now, 30);
        filtered = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= start && date <= now;
        });
        break;
      }

      case 'byMonth': {
        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-').map(Number);
          const start = startOfMonth(new Date(year, month - 1));
          const end = endOfMonth(new Date(year, month - 1));
          filtered = transactions.filter(t => {
            const date = new Date(t.date);
            return isWithinInterval(date, { start, end });
          });
        }
        break;
      }

      case 'custom': {
        if (customStartDate && customEndDate) {
          const start = parseISO(customStartDate);
          const end = parseISO(customEndDate);
          filtered = transactions.filter(t => {
            const date = new Date(t.date);
            return isWithinInterval(date, { start, end });
          });
        } else {
          filtered = transactions;
        }
        break;
      }

      default:
        filtered = transactions;
    }

    setFilteredByDate(filtered);
  }, [transactions, filterType, selectedMonth, customStartDate, customEndDate]);

  const filteredTransactions = filteredByDate.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { getApi } = useAuth();
  const api = getApi();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      toast.success("Transaction deleted successfully");
      onTransactionUpdated();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction. Please try again.");
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const transactionDate = new Date(transaction.date);
    const formattedDate = transactionDate.toISOString().split("T")[0];

    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      date: formattedDate,
    });
    setIsEditing(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? value.replace(/[^0-9.]/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      const transactionData = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString(),
      };

      await api.put(
        `/api/transactions/${editingTransaction._id}`,
        transactionData
      );

      toast.success("Transaction updated successfully");
      setIsEditing(false);
      onTransactionUpdated();
    } catch (error: any) {
      console.error(
        "Error updating transaction:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to update transaction: ${error.response?.data?.message || "Please try again"
        }`
      );
    }
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'all':
        return 'All Time';
      case 'thisMonth':
        return format(new Date(), 'MMMM yyyy');
      case 'last30Days':
        return 'Last 30 Days';
      case 'byMonth':
        return format(parseISO(selectedMonth + '-01'), 'MMMM yyyy');
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(parseISO(customStartDate), 'MMM dd, yyyy')} - ${format(parseISO(customEndDate), 'MMM dd, yyyy')}`;
        }
        return 'Custom Range';
      default:
        return 'Filter Active';
    }
  };

  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-[#1f2226] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {showViewAll ? 'Recent Transactions' : 'All Transactions'}
        </h2>
        {showViewAll && (
          <button
            className="flex items-center text-[#e05b19] hover:text-[#d14d0f] font-medium transition-colors duration-200"
            onClick={() => {
              setActiveTab?.("transactions");
            }}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>

      {/* Advanced Filters - Only show when not in "View All" mode */}
      {!showViewAll && (
        <>
          {/* Filter Type Buttons */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-[#e05b19]" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Date Filters
                </h3>
              </div>
              {filterType !== 'thisMonth' && (
                <button
                  onClick={() => {
                    setFilterType('thisMonth');
                    setSelectedMonth(format(new Date(), 'yyyy-MM'));
                  }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e05b19] dark:hover:text-[#e05b19] transition-colors duration-200 flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <button
                onClick={() => setFilterType('thisMonth')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${filterType === 'thisMonth'
                    ? 'border-[#e05b19] bg-[#e05b19]/10 text-[#e05b19]'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:border-[#e05b19]/50'
                  }`}
              >
                This Month
              </button>
              <button
                onClick={() => setFilterType('last30Days')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${filterType === 'last30Days'
                    ? 'border-[#e05b19] bg-[#e05b19]/10 text-[#e05b19]'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:border-[#e05b19]/50'
                  }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setFilterType('byMonth')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${filterType === 'byMonth'
                    ? 'border-[#e05b19] bg-[#e05b19]/10 text-[#e05b19]'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:border-[#e05b19]/50'
                  }`}
              >
                By Month
              </button>
              <button
                onClick={() => setFilterType('custom')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${filterType === 'custom'
                    ? 'border-[#e05b19] bg-[#e05b19]/10 text-[#e05b19]'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:border-[#e05b19]/50'
                  }`}
              >
                Custom Range
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${filterType === 'all'
                    ? 'border-[#e05b19] bg-[#e05b19]/10 text-[#e05b19]'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#16191f] text-gray-700 dark:text-gray-300 hover:border-[#e05b19]/50'
                  }`}
              >
                All Time
              </button>
            </div>

            {/* Month Selector */}
            {filterType === 'byMonth' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent transition-all duration-200"
                >
                  {availableMonths.length > 0 ? (
                    availableMonths.map(month => (
                      <option key={month} value={month}>
                        {format(parseISO(month + '-01'), 'MMMM yyyy')}
                      </option>
                    ))
                  ) : (
                    <option value={format(new Date(), 'yyyy-MM')}>
                      {format(new Date(), 'MMMM yyyy')}
                    </option>
                  )}
                </select>
              </div>
            )}

            {/* Custom Date Range */}
            {filterType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Active Filter Banner */}
            <div className="p-4 bg-[#e05b19]/10 border border-[#e05b19]/30 rounded-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[#e05b19]" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Period: <span className="text-[#e05b19]">{getFilterLabel()}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-2 bg-white dark:bg-[#16191f] px-3 py-1.5 rounded-md">
                    <span className="text-gray-600 dark:text-gray-400">Count:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-[#16191f] px-3 py-1.5 rounded-md">
                    <span className="text-gray-600 dark:text-gray-400">Income:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      +₹{totalIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-[#16191f] px-3 py-1.5 rounded-md">
                    <span className="text-gray-600 dark:text-gray-400">Expenses:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      -₹{totalExpenses.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Simple search for "View All" mode */}
      {showViewAll && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No transactions found
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#16191f] rounded-lg border border-gray-100 dark:border-gray-600 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-500 transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </h3>
                  <span
                    className={`font-bold ${transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                      }`}
                  >
                    ₹{transaction.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {transaction.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  title="edit"
                  onClick={() => handleEditClick(transaction)}
                  className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-[#e05b19] dark:hover:text-[#e05b19] transition-all duration-200 hover:scale-110"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  title="delete"
                  onClick={() => handleDelete(transaction._id)}
                  className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {isEditing && (
        <EditModal
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
};

export default TransactionList;
