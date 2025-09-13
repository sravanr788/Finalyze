import express from 'express';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction, parseTransaction } from '../controllers/transactionController.js';
import isAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/parse', isAuth, parseTransaction);
router.post('/', isAuth, createTransaction);
router.get('/', isAuth, getTransactions);
router.put('/:id', isAuth, updateTransaction);
router.delete('/:id', isAuth, deleteTransaction);

export default router;
