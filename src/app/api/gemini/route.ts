// app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // Add system context to ensure the AI stays focused on scholarship information
    const systemContext = `You are IskoBot, a helpful assistant specializing in scholarship and college application information for students. 
    Your goal is to provide accurate, concise, and helpful information about scholarships, application processes, deadlines, and required documents.
    Always be encouraging and supportive of students' educational goals. you should answer the questions in a friendly and informative manner also in taglish langauge.`;
    
    // Prepare the conversation history
    const userMessages = requestData.messages || [];
    
    // Format messages for Gemini API
    const conversationHistory = userMessages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    
    // Prepare the request body
    const geminiRequestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemContext }]
        },
        ...conversationHistory
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    // Make the API request to Gemini
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(geminiRequestBody)
    });

    const data = await geminiResponse.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Error communicating with Gemini API");
    }

    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Sorry, I couldn't process your request at the moment. Please try again.";

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}