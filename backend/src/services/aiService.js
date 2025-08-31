// src/services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the core prompt for the AI to follow
const PROMPT_TEMPLATE = (text) => `
You are a financial parsing assistant. Your task is to extract three key pieces of information from a natural language transaction description: the amount, the category, and a brief description.

The category should be one of the following: "Income", "Groceries", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other". If no category is specified, make a reasonable guess.

Your response MUST be a valid JSON object with the following structure. Do not include any extra text or conversation.

{
  "amount": number,
  "category": string,
  "description": string
}

Here is the transaction text: "${text}"
`;

// Main function to parse the transaction using the AI
const aiParser = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(PROMPT_TEMPLATE(text));
        
        // Ensure the response is in the expected format
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json\n|```/g, '').trim();

        // Attempt to parse the JSON
        const parsedData = JSON.parse(cleanedText);
        
        // Basic validation of parsed data
        if (!parsedData.amount || !parsedData.category) {
          throw new Error('AI parsing failed to return required fields.');
        }

        return parsedData;

    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("AI parsing failed. Please try again.");
    }
};

export default aiParser;