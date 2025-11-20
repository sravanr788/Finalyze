  import axios from 'axios';
  import { Transaction } from '../types';

  const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/transactions/';

  export const getTransactions = async (userId: string) => {
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
      return response.data.transaction;
    } catch (error) {
      console.error('Failed to save transaction:', error);
      throw error;
    } finally {
      window.location.reload();
    }
  };

  export const deleteTransaction = async (id: string) => {
    try {
      await axios.delete(`${API_URL}${id}`, { withCredentials: true });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    } finally {
      window.location.reload();
    }
  };
