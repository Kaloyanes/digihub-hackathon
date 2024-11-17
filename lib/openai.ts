import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function validateAnswer(
  correctAnswer: string,
  userAnswer: string,
  question: string,
) {
  const prompt = `
    You are an intelligent answer validator for an programming educational app.
    
    Question: "${question}"
    Correct answer: "${correctAnswer}"
    User's answer: "${userAnswer}"
    
    Consider the following in your evaluation:
    1. Semantic similarity (meaning is the same even if words are different)
    2. Common spelling mistakes
    3. Different ways to express the same concept
    4. Mathematical equivalence if applicable
    
    Respond only with "true" if the answer is correct or "false" if it's incorrect.
    `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 5,
  });

  return response.choices[0].message.content?.trim().toLowerCase() === "true";
}
