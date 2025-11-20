import Transaction from '../models/Transaction.js';
import { connectToDatabase } from '../../db.js';
import aiParser from '../services/aiService.js';
import resolveDate from '../services/dateResolver.js';

// AI parsing logic
const parseTransaction = async (req, res) => {
    await connectToDatabase();
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Transaction text is required.' });
        }

        // Call the AI service to parse the text
        const parsedData = await aiParser(text , new Date().toISOString().split("T")[0]);

        res.status(200).json({ message: 'Transaction parsed successfully.', parsedData });
    } catch (error) {
        res.status(500).json({ message: 'Failed to parse transaction.', error: error.message });
    }
};

// Create a new transaction
 const createTransaction = async (req, res) => {
    await connectToDatabase();
    try {
        const { amount, category,type,userId,date, description,originalText } = req.body;
        
        const newTransaction = new Transaction({
            amount,
            category,
            description,
            type,
            userId,
            date: resolveDate(originalText || description, date)
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json({ message: 'Transaction added successfully.', transaction: savedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create transaction.', error: error.message });
    }
};

// Get all transactions for the authenticated user
const getTransactions = async (req, res) => {
    await connectToDatabase();
    try {
        const {userId} = req.query;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        res.status(200).json({ message: 'Transactions retrieved successfully.', transactions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve transactions.', error: error.message });
    }
};

// Update a specific transaction
const updateTransaction = async (req, res) => {
    await connectToDatabase();
    try {
        const transactionId = req.params.id;
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            req.body,
            { new: true } 
        );
        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        res.status(200).json({ message: 'Transaction updated successfully.', transaction: updatedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update transaction.', error: error.message });
    }
};

// Delete a specific transaction
const deleteTransaction = async (req, res) => {
    await connectToDatabase();
    try {
        const transactionId = req.params.id;
        const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete transaction.', error: error.message });
    }
};

export { createTransaction, getTransactions, updateTransaction, deleteTransaction, parseTransaction };