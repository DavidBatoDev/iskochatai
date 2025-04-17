// app/api/chat/[id]/route.ts (for authenticated users)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch chat messages for a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Correctly await params before using id
    const id = await params.id;
    const conversationId = id;
    
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = key === 'authorization' ? 'Bearer [REDACTED]' : value;
    });
    
    // Try getting userId from multiple sources
    let userId = null;
    
    // 1. From X-User-ID header
    const userIdHeader = request.headers.get('X-User-ID');
    if (userIdHeader) {
      userId = userIdHeader;
    }
    
    // 2. From query parameter
    if (!userId) {
      const url = new URL(request.url);
      const userIdParam = url.searchParams.get('userId');
      if (userIdParam) {
        userId = userIdParam;
      }
    }
    
    // 3. From authorization header
    if (!userId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token && token !== "undefined" && token !== "null") {
          try {
            const { data, error } = await supabase.auth.getUser(token);
            if (!error && data.user) {
              userId = data.user.id;
              console.log("Found userId from token:", userId);
            } else {
              console.log("Failed to get user from token:", error?.message);
            }
          } catch (supabaseError) {
            console.error("Supabase auth error:", supabaseError);
          }
        } else {
          console.log("Invalid token format:", token);
        }
      } else {
        console.log("No valid Authorization header");
      }
    }
    
   // If we still don't have a userId, return unauthorized
   if (!userId) {
    console.log("No userId found, returning 401");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the user owns this conversation
  const { data: convoData, error: convoError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convoError || !convoData) {
    console.log("Conversation not found or not owned by user:", convoError);
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Get the chat history
  const { data: chatHistory, error: chatError } = await supabase
    .from('chat_history')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (chatError) {
    console.error("Error fetching chat history:", chatError);
    throw chatError;
  }

  // Transform the data - each row contains both user message and AI response
  const messages = [];
  
  for (const entry of chatHistory || []) {
    // Add the user message first
    if (entry.message && entry.message.trim() !== '') {
      messages.push({
        role: 'user',
        message: entry.message,
        created_at: entry.created_at,
        used_search: false,
        references: []
      });
    }
    
    // Then add the AI response
    if (entry.response && entry.response.trim() !== '') {
      messages.push({
        role: 'assistant',
        message: entry.response,
        created_at: entry.created_at,
        used_search: entry.used_search || false,
        references: entry.references || []
      });
    }
  }

  console.log("Returning messages count:", messages.length || 0);
  return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Send a message and get a response from Gemini
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const conversationId = id;


    const { messages, enableWebSearch } = await request.json();
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this is a new conversation or existing one
    let actualConversationId = conversationId;
    
    if (conversationId === 'new') {
      // Create a new conversation
      const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          last_message: messages[messages.length - 1].content,
          last_message_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      actualConversationId = newConvo.id;
    } else {
      // Verify the user owns this conversation
      const { data: convoData, error: convoError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (convoError) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1];

    console.log(request.nextUrl.origin);

    try {
      // Call the Gemini API with user ID and conversation ID
      const geminiResponse = await fetch(`${request.nextUrl.origin}/api/gemini`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
          'X-User-ID': userId
        },
        body: JSON.stringify({ 
          messages, 
          enableWebSearch,
          userId,
          conversationId: actualConversationId
        })
      });

      // Check if the response is ok
      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        throw new Error(errorData.error || 'Failed to get response from Gemini API');
      }

      const data = await geminiResponse.json();

      // Handle case where response might be null
      const responseText = data.response || "Sorry, I couldn't generate a response at this time.";

      // Store both user message and AI response in the same row
      const { error: insertError } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          conversation_id: actualConversationId,
          message: userMessage.content, // User message
          response: responseText,       // AI response (with fallback)
          used_search: data.usedSearch || false, // Track if search was used
          references: data.references || [],  // Store references
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Update the conversation's last message and timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message: userMessage.content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', actualConversationId);

      if (updateError) throw updateError;

      return NextResponse.json({
        response: responseText,
        usedSearch: data.usedSearch || false,
        references: data.references || [],
        conversationId: actualConversationId
      });
    } catch (error: any) {
      console.error('Error with Gemini API:', error);
      
      // Fallback response in case of Gemini API failure
      const fallbackResponse = "I'm sorry, I'm having trouble connecting to my services right now. Please try again later.";
      
      // Still store the user message and fallback response
      const { error: insertError } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          conversation_id: actualConversationId,
          message: userMessage.content,
          response: fallbackResponse,
          used_search: false,
          references: [],
          created_at: new Date().toISOString()
        });
      
      // Update the conversation's last message and timestamp
      await supabase
        .from('conversations')
        .update({
          last_message: userMessage.content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', actualConversationId);
      
      return NextResponse.json({
        response: fallbackResponse,
        usedSearch: false,
        references: [],
        conversationId: actualConversationId,
        error: 'Service temporarily unavailable'
      });
    }
  } catch (error: any) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Reset chat history
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Correctly await params before using id
    const id = await params.id;
    const conversationId = id;
    
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all messages in this conversation
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update the conversation to reset it
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: 'New Conversation',
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resetting chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to get user ID from request
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // First check for X-User-ID header
    const userId = request.headers.get('X-User-ID');
    
    if (userId) {
      return userId;
    }
    
    // Then check for Authorization header with bearer token
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        return data.user.id;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getUserIdFromRequest:', error);
    return null;
  }
}