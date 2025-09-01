import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveTransaction } from '../utils/storage';
import { Transaction } from '../types';
import { Send, Check, X, Brain } from 'lucide-react';
import axios from 'axios';

interface Props {
  onTransactionAdded: () => void;
}

const TransactionEntry: React.FC<Props> = ({ onTransactionAdded }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [parsedTransaction, setParsedTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);

    // AI processing delay
    const parsedData = await axios.post('http://localhost:5000/api/transactions/parse', { text: input }, {
      withCredentials: true,
    });
    setParsedTransaction(parsedData.data.parsedData);
    console.log(parsedData.data.parsedData);
    setIsLoading(false);
  };

  const handleSave = () => {
    if (!user || !parsedTransaction) return;

    const transaction: Transaction = {
      userId: user.id,
      ...parsedTransaction,
    };

    saveTransaction(transaction);
    setInput('');
    setParsedTransaction(null);
    onTransactionAdded();
  };

  const handleCancel = () => {
    setParsedTransaction(null);
  };

  return (
    <div className="bg-white dark:bg-[#1f2226] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-6 w-6 text-[#e05b19]" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Smart Transaction Entry
        </h2>
      </div>

      {!parsedTransaction ? (
        <div className="space-y-4">
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try: "Bought coffee at Starbucks for $6.50" or "Got paid $3500 salary today"'
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-[#e05b19] focus:border-transparent bg-white dark:bg-[#16191f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleParse}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-full py-3 px-4 bg-[#e05b19] hover:bg-[#d14d0f] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Parse with AI
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-[#16191f] rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Parsed Transaction</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                parsedTransaction.confidence > 0.8 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : parsedTransaction.confidence > 0.6
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {Math.round(parsedTransaction.confidence * 100)}% confidence
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <p className={`font-medium ${
                  parsedTransaction.type === 'income' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {parsedTransaction.type === 'income' ? '+' : '-'}${parsedTransaction.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <p className="font-medium text-gray-900 dark:text-white">{parsedTransaction.category}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Description:</span>
                <p className="font-medium text-gray-900 dark:text-white">{parsedTransaction.description}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Check className="h-5 w-5 mr-2" />
              Save Transaction
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionEntry;