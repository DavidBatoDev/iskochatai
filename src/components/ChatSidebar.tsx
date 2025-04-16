// components/ChatSidebar.tsx
import React, { useEffect } from "react";
import { MessageSquare, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { useConversationsStore } from "@/lib/conversationStore";
import { fetchConversations } from "@/lib/api";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  createNewChat: () => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sidebarOpen,
  createNewChat,
  deleteConversation,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { conversations, currentConversationId } = useConversationsStore();
  const router = useRouter();

  // Fetch conversations when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchConversations();
    }
  }, [isAuthenticated, user?.id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Truncate message for preview
  const truncateMessage = (message: string, maxLength = 30) => {
    if (!message) return "New Chat";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const navigateToConversation = (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Set current conversation ID in the store
    useConversationsStore.getState().setCurrentConversationId(conversationId);
    // Navigate to the conversation
    router.push(`/dashboard/chat/${conversationId}`);
  };

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-0 -ml-64"
      } bg-indigo-800 border-r border-blue-900 bg-opacity-80 backdrop-blur-md flex-shrink-0 transition-all duration-300 z-10 shadow-xl overflow-hidden flex flex-col h-full`}
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
          Conversations
        </h2>
        <button
          onClick={createNewChat}
          className="text-white hover:text-yellow-300 transition"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 space-y-1">
          {conversations.map((conversation: { id: React.Key | null | undefined; last_message: string; last_message_at: string; }) => (
            <a 
              href={`/dashboard/chat/${conversation.id}`}
              key={conversation.id}
              onClick={(e) => navigateToConversation(String(conversation.id), e)}
              className={`flex items-center justify-between p-3 rounded-lg hover:bg-indigo-800 hover:bg-opacity-10 transition cursor-pointer ${
                conversation.id === currentConversationId ? "bg-indigo-900 bg-opacity-10" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {truncateMessage(conversation.last_message)}
                </p>
                <p className="text-xs text-gray-300">
                  {formatDate(conversation.last_message_at)}
                </p>
              </div>
              <button
                onClick={(e) => deleteConversation(String(conversation.id), e)}
                className="text-gray-400 hover:text-red-500 transition ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;