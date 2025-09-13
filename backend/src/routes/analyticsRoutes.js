// src/routes/analyticsRoutes.js
import express from 'express';
import { getFinancialSummary, getSpendingByCategory, getSpendingTrends } from '../controllers/analyticsController.js';
import isAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/summary', isAuth, getFinancialSummary);
router.get('/categories', isAuth, getSpendingByCategory);
router.get('/trends', isAuth, getSpendingTrends);

export default router;