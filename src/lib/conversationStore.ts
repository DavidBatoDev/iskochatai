// lib/conversationsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Conversation {
  id: string;
  last_message: string;
  last_message_at: string;
  is_active: boolean;
}

interface ConversationsState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useConversationsStore = create<ConversationsState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      
      setConversations: (conversations) => set({ conversations }),
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      addConversation: (conversation) => 
        set((state) => ({ 
          conversations: [...state.conversations, conversation],
        })),
      updateConversation: (id, updates) => 
        set((state) => ({ 
          conversations: state.conversations.map((conv) => 
            conv.id === id ? { ...conv, ...updates } : conv
          ),
        })),
      removeConversation: (id) => 
        set((state) => ({ 
          conversations: state.conversations.filter((conv) => conv.id !== id),
        })),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'conversations-storage',
    }
  )
);