  import axios from 'axios';
  import { Transaction } from '../types';

  const API_URL = 'http://localhost:5000/api/transactions/';

  export const getTransactions = async (userId: String) => {
    try {
      const response = await axios.get(`${API_URL}?userId=${userId}`, { withCredentials: true });
      return response.data.transactions;
    } catch (error) {
      console.error('Failed to retrieve transactions:', error);
      throw error;
    }
  };

  export const saveTransaction = async (transaction: Transaction) => {
    try {
      const response = await axios.post(API_URL, transaction, { withCredentials: true });
      window.location.reload();
      return response.data.transaction;
    } catch (error) {
      console.error('Failed to save transaction:', error);
      throw error;
    }
  };

  export const deleteTransaction = async (id: String) => {
    try {
      await axios.delete(`${API_URL}${id}`, { withCredentials: true });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  };
