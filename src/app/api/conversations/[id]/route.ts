// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DELETE - Delete a conversation by ID
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const conversationId = params.id;
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, delete all chat messages in this conversation
    const { error: chatDeleteError } = await supabase
      .from('chat_history')
      .delete()
      .eq('conversation_id', conversationId);

    if (chatDeleteError) throw chatDeleteError;

    // Then delete the conversation
    const { error: convoDeleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId); // Ensure user owns this conversation

    if (convoDeleteError) throw convoDeleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
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