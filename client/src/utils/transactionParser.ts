import { ParsedTransaction } from '../types';

const CATEGORY_KEYWORDS = {
  'Food & Dining': ['restaurant', 'food', 'coffee', 'starbucks', 'mcdonald', 'pizza', 'lunch', 'dinner', 'breakfast', 'cafe', 'panda express'],
  'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'parking', 'shell', 'bp', 'chevron'],
  'Electronics': ['samsung', 'apple', 'phone', 'computer', 'laptop', 'watch', 'tablet', 'headphones', 'tv'],
  'Shopping': ['amazon', 'target', 'walmart', 'mall', 'store', 'clothes', 'shoes'],
  'Entertainment': ['movie', 'theater', 'netflix', 'spotify', 'game', 'concert'],
  'Income': ['salary', 'paid', 'paycheck', 'income', 'bonus', 'freelance'],
  'Bills & Utilities': ['electric', 'water', 'internet', 'phone bill', 'rent', 'mortgage'],
  'Healthcare': ['doctor', 'pharmacy', 'medicine', 'hospital', 'dental'],
  'Other': []
};

export const parseTransaction = (input: string): ParsedTransaction => {
  const cleanInput = input.toLowerCase().trim();
  
  // Extract amount
  const amountMatch = cleanInput.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  // Determine if it's income
  const isIncome = /paid|salary|paycheck|income|bonus|freelance|received/.test(cleanInput);
  const type = isIncome ? 'income' : 'expense';
  
  // Extract description (remove amount and common words)
  let description = input
    .replace(/\$?\d+(?:\.\d{2})?/g, '')
    .replace(/\b(just|bought|spent|paid|got|ordered|at|for|on|today|yesterday)\b/gi, '')
    .trim();
  
  if (!description) {
    description = type === 'income' ? 'Income' : 'Expense';
  }
  
  // Categorize
  let category = 'Other';
  let confidence = 0.3;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (cleanInput.includes(keyword)) {
        category = cat;
        confidence = 0.9;
        break;
      }
    }
    if (confidence > 0.5) break;
  }
  
  // Boost confidence for explicit category mentions
  if (cleanInput.includes(' - ')) {
    const parts = input.split(' - ');
    if (parts.length > 1) {
      const explicitCategory = parts[1].trim();
      const categoryMatch = Object.keys(CATEGORY_KEYWORDS).find(cat => 
        cat.toLowerCase().includes(explicitCategory.toLowerCase()) ||
        explicitCategory.toLowerCase().includes(cat.toLowerCase())
      );
      if (categoryMatch) {
        category = categoryMatch;
        confidence = 0.95;
      }
    }
  }
  
  return {
    amount,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    category,
    type,
    confidence
  };
};