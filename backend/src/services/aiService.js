import Groq from 'groq-sdk';

// Access API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

Return the result as a valid JSON object with a "transactions" key containing the array:

{
  "transactions": [
    {
      "amount": number,
      "category": string,
      "description": string,
      "type": string,
      "date": string (ISO 8601),
      "confidence": number
    }
  ]
}

Here is the transaction text: "${text}"
`;


// Main function to parse the transaction using the AI
const aiParser = async (text, today) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: PROMPT_TEMPLATE(text, today) + "\n\nIMPORTANT: Return ONLY the JSON object. Do not include any explanation or other text.",
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0]?.message?.content || "";
    console.log(responseText);

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON: " + responseText);
    }

    // Extract the transactions array if wrapped in a key
    if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
      parsedData = parsedData.transactions;
    } else if (Array.isArray(parsedData)) {
      // If it returns an array directly (though json_object usually returns an object)
      parsedData = parsedData;
    } else {
      // If it returns a single object that looks like a transaction, wrap it
      if (parsedData.amount && parsedData.category) {
        parsedData = [parsedData];
      } else {
        throw new Error("AI returned an unexpected JSON structure.");
      }
    }

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