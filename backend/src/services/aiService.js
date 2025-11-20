import { GoogleGenAI } from '@google/genai';
// Access API key from environment variables
const genAI = new GoogleGenAI({ apiKey : process.env.GEMINI_API_KEY });

// core prompt for the AI to follow
const PROMPT_TEMPLATE = (text, today) => `
You are a financial parsing assistant. Your task is to extract one or more transactions from a natural language description. 

For each transaction, extract:
- amount
- category
- description
- type
- date (if mentioned, resolve relative dates based on today's date: ${today})
- confidence

Rules:
- The category should be one of: "Income", "Groceries", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other".
- The transaction type should be "income" or "expense".
- Dates must be returned in ISO 8601 format (YYYY-MM-DD).
- If no date is mentioned, use today's date: ${today}.
- Resolve words like "yesterday", "last Friday", "next Monday" relative to ${today}.
- Confidence score should be a number between 0.0 and 1.0.

Return the result as a valid JSON array of objects in this structure:

[
  {
    "amount": number,
    "category": string,
    "description": string,
    "type": string,
    "date": string (ISO 8601),
    "confidence": number
  }
]

Here is the transaction text: "${text}"
`;


// Main function to parse the transaction using the AI
const aiParser = async (text,today) => {
  try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: PROMPT_TEMPLATE(text, today),
      });

      const responseText = response.text;
      console.log(responseText);
      const cleanedText = responseText.replace(/```json\n|```/g, '').trim();

      const parsedData = JSON.parse(cleanedText);

      // Ensure it's always an array
      if (!Array.isArray(parsedData)) {
          throw new Error("AI did not return an array of transactions.");
      }

      // Validate each transaction object
      parsedData.forEach((t, idx) => {
          if (
              typeof t.amount !== "number" ||
              typeof t.category !== "string" ||
              typeof t.type !== "string" ||
              typeof t.confidence !== "number"
          ) {
              throw new Error(`Transaction at index ${idx} is missing required fields.`);
          }
      });

      return parsedData;

  } catch (error) {
      console.error("AI Service Error:", error.message);
      throw new Error("AI parsing failed. Please try again.");
  }
};


export default aiParser;