// app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user ID from session or auth header
    const userId = await getUserIdFromRequest(request);
    console.log(userId)
    if (!userId) {
        console.log(userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query the conversations table
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    // Get user ID from session or auth header
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a new conversation record
    const newConversation = {
      user_id: userId,
      last_message: 'New Conversation',
      last_message_at: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(newConversation)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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