import { GoogleGenAI, Type } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please set it in the Secrets panel.");
    }
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

export async function getInventoryInsights(inventoryData: any, transactions: any) {
  try {
    const ai = getGenAI();
    const prompt = `
      You are an expert warehouse analyst for Elnusa, an oil and gas services company.
      Analyze the following inventory and transaction data and provide 3-4 actionable insights.
      Focus on:
      1. Potential stockouts based on transaction trends.
      2. Slow-moving items that might be taking up space.
      3. Anomalies or suggestions for better organization.
      4. Safety or maintenance reminders for specific categories.

      Inventory Data: ${JSON.stringify(inventoryData)}
      Recent Transactions: ${JSON.stringify(transactions)}

      Format your response as a JSON array of objects, each with:
      - title: A short, catchy title for the insight.
      - description: A detailed explanation and recommendation.
      - priority: 'high', 'medium', or 'low'.
      - category: The inventory category it relates to.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
              category: { type: Type.STRING }
            },
            required: ['title', 'description', 'priority', 'category']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    throw new Error("Failed to generate AI insights");
  }
}
