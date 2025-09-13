import React, { useState } from 'react';
import { Transaction } from '../types';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EditModal from './EditModal';

interface Props {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
  showViewAll?: boolean;
  setActiveTab?: (tab: 'overview' | 'transactions' | 'analytics') => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onTransactionUpdated, showViewAll, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    date: ''
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { getApi } = useAuth();
  const api = getApi();

  const handleDelete = async (id: string) => {
    
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      window.location.reload();
      onTransactionUpdated();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const transactionDate = new Date(transaction.date);
    const formattedDate = transactionDate.toISOString().split("T")[0]; // "2025-09-01"

    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      date: formattedDate
    });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
  
    try {
      const transactionData = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString()
      };
    
      await api.put(`/api/transactions/${editingTransaction._id}`, transactionData);
  
      setIsEditing(false);
      onTransactionUpdated();
    } catch (error: any) {
      console.error("Error updating transaction:", error.response?.data || error.message);
      alert("Failed to update transaction. Please try again.");
    }
  };
  
  return (
    <div className="bg-white dark:bg-[#1f2226] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        {showViewAll && (
          <button className="flex items-center text-[#e05b19] hover:text-[#d14d0f] font-medium transition-colors duration-200"
          onClick={() => {setActiveTab?.('transactions')}}>
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>

      {!showViewAll && (
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
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div 
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#16191f] rounded-lg border border-gray-100 dark:border-gray-600 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </h3>
                  <span className={`font-bold ${transaction.type === 'income' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'}`}>
                     ₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {transaction.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button 
                  onClick={() => handleEditClick(transaction)}
                  className="p-2 hover:cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(transaction._id)}
                  className="p-2 hover:cursor-pointer hover:text-red-600 text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {isEditing && <EditModal formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} setIsEditing={setIsEditing} />}
    </div>
  );
};

export default TransactionList;