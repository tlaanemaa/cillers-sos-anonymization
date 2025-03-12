// ai/verify.ts
"use server"
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function verify(text: string, prompt: string): Promise<boolean> {
  try {
    // Create a generative model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Craft the prompt
    const fullPrompt = `
    ${prompt}
    Text to analyze: "${text}"
    `;

   
    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text().trim().toLowerCase();
    console.log('AI verification response:', responseText);
    
    const found = responseText.includes('true');
    
    // Check if the response indicates something was found
    return found;
  } catch (error) {
    console.error('Error in AI verification:', error);
    return false;
  }
}