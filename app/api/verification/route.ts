import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { text, prompt } = await request.json();
    
    // Create a generative model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Craft a prompt for birthday detection
    const fullPrompt = `
      ${prompt}
            
      Text to analyze: "${text}"
    `;
    
    // Generate content
    const result = await model.generateContent(fullPrompt);
    //console.log('Generated content:', result);
    const response = await result.response;
    const responseText = response.text().trim().toLowerCase();
    
    // Check if the response indicates a birthday was found
    const containsBirthday = responseText === 'true';
    
    return NextResponse.json({ containsBirthday });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}