import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// Get a summary of income, expenses, and savings
export const getFinancialSummary = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId); 
        
        const result = await Transaction.aggregate([
            { $match: { userId } },
            { $group: {
                _id: {
                    $cond: [
                        { $eq: ['$type', 'income'] },
                        'income',
                        'expense'
                    ]
                },
                total: { $sum: '$amount' }
            }}
        ]);

        // Initialize with default values
        const summary = {
            totalIncome: 0,
            totalExpenses: 0,
            savings: 0
        };

        // Process aggregation results
        result.forEach(item => {
            if (item._id === 'income') {
                summary.totalIncome = item.total;
            } else {
                summary.totalExpenses = item.total;
            }
        });

        summary.savings = summary.totalIncome - summary.totalExpenses;

        res.status(200).json({
            message: 'Financial summary retrieved successfully.',
            summary
        });
    } catch (error) {
        console.error('Error in getFinancialSummary:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve financial summary.', 
            error: error.message 
        });
    }
};

// Get spending grouped by category for the pie chart
export const getSpendingByCategory = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId); 
        const { startDate, endDate } = req.query;
        
        const matchStage = { 
            userId,
            type: 'expense'
        };

        // Add date range filtering if provided
        if (startDate && endDate) {
            matchStage.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const spending = await Transaction.aggregate([
            { $match: matchStage },
            { 
                $group: {
                    _id: '$category',
                    totalSpent: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $project: {
                category: '$_id',
                totalSpent: 1,
                count: 1,
                _id: 0
            }}
        ]);

        res.status(200).json({ 
            message: 'Spending by category retrieved successfully.', 
            data: spending 
        });
    } catch (error) {
        console.error('Error in getSpendingByCategory:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve spending by category.', 
            error: error.message 
        });
    }
};

// Get spending trends over time for the line chart
export const getSpendingTrends = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId); 
        const { period = 'monthly', category } = req.query; // period can be 'daily', 'weekly', 'monthly', 'yearly'
        const { startDate, endDate } = req.query;
        
        const matchStage = { 
            userId,
            type: 'expense'
        };

        // Add category filter if provided
        if (category) {
            matchStage.category = category;
        }

        // Add date range filtering if provided
        if (startDate && endDate) {
            matchStage.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Determine the date format based on period
        let dateFormat = '%Y-%m';
        if (period === 'daily') dateFormat = '%Y-%m-%d';
        else if (period === 'weekly') dateFormat = '%Y-%U';
        else if (period === 'yearly') dateFormat = '%Y';

        const trends = await Transaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: dateFormat, 
                            date: '$date' 
                        }
                    },
                    totalSpent: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
                    categories: { $addToSet: '$category' }
                }
            },
            { 
                $project: {
                    date: '$_id',
                    totalSpent: 1,
                    transactionCount: 1,
                    categoryCount: { $size: '$categories' },
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        res.status(200).json({ 
            message: 'Spending trends retrieved successfully.', 
            data: trends,
            period,
            category: category || 'all'
        });
    } catch (error) {
        console.error('Error in getSpendingTrends:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve spending trends.', 
            error: error.message 
        });
    }
};
