// ai/verify.ts
"use server"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VerificationResultType } from "@/app/service/types";

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function verify(issue_id: string, text: string, prompt: string): Promise<VerificationResultType> {

    // Define the system instruction
    const systemMessage = `
    You are an AI assistant specialized in identifying specific categories of information in text.
    You must respond ONLY in valid JSON format: { "found": boolean, "evidence": string[] }

    - If you find the requested category of information in the text, set "found" to true and include the specific evidence in the "evidence" array
    - If you don't find the category, set "found" to false and return an empty evidence array
    - Each evidence item should be a direct quote from the original text
    - Include only the most relevant evidence, limited to 3 items maximum
    - Do not explain your reasoning - respond only with the JSON object
    `;
  try {
    // Create a generative model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: systemMessage });

    
    
    // Craft the prompt
    const fullPrompt = `
    ${prompt}
    Text to analyze: "${text}"
    `;


    // Generate content
    const result = await model.generateContent(fullPrompt,);
    const response = await result.response;

    const trimResponse = response.text().trim();

    let found = false;
    let evidence = [];
    
    // Parse the response with robust error handling
    try {
        // Try to extract JSON from the response if needed
        const jsonMatch = trimResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : trimResponse;
        
        const parsedResponse = JSON.parse(jsonString);
        
        // Validate the structure
        if (typeof parsedResponse.found !== 'boolean') {
          throw new Error('Invalid "found" property');
        }
        
        if (!Array.isArray(parsedResponse.evidence)) {
          throw new Error('Invalid "evidence" property');
        }
        
        found= parsedResponse.found;
        evidence= parsedResponse.evidence;
        
      } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Response text:', trimResponse);
      }
   

    console.log('AI found:', found);
    console.log('AI evidence:', evidence);
    //console.log('AI verification response:', responseText);

   
    
    //const found = responseText.found;
    
    // Check if the response indicates something was found
    return {
        issue_id: issue_id,
        found: found,
        evidence: evidence
      };
  } catch (error) {
    console.error('Error in AI verification:', error);
    return {
        issue_id: issue_id,
        found: false,
        evidence: []
      };
  }
}