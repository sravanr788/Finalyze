import dotenv from 'dotenv';
dotenv.config();

// Dynamic import to ensure env vars are loaded before service initialization
const { default: aiParser } = await import('./src/services/aiService.js');

const testText = "Spent 50 dollars on groceries yesterday";
const today = new Date().toISOString().split('T')[0];

console.log(`Testing with text: "${testText}"`);

try {
    const result = await aiParser(testText, today);
    console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
    console.error("Test failed:", error);
}
