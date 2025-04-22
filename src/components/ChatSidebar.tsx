// components/ChatSidebar.tsx
import React, { useEffect, useState } from "react";
import { MessageSquare, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { useConversationsStore } from "@/lib/conversationStore";
import { fetchConversations } from "@/lib/api";
import * as AlertDialog from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  createNewChat: () => void;
  deleteConversation: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sidebarOpen,
  createNewChat,
  deleteConversation,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { conversations, currentConversationId } = useConversationsStore();
  const router = useRouter();
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  // Fetch conversations when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchConversations();
    }
  }, [isAuthenticated, user?.id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Truncate message for preview
  const truncateMessage = (message: string, maxLength = 30) => {
    if (!message) return "New Chat";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const navigateToConversation = (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    // Set current conversation ID in the store
    useConversationsStore.getState().setCurrentConversationId(conversationId);
    // Navigate to the conversation
    router.push(`/dashboard/chat/${conversationId}`);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConversationToDelete(id);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
  };

  return (
    <>
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0 -ml-64"
        } bg-indigo-800 border-r border-blue-900 bg-opacity-80 backdrop-blur-md flex-shrink-0 transition-all duration-300 z-10 shadow-xl flex flex-col h-full`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
            Conversations
          </h2>
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <button
                onClick={createNewChat}
                className="text-white hover:text-yellow-300 transition-all duration-200 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={15}
              className="bg-indigo-950"
            >
              <p className="text-xs text-white">New Chat</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 space-y-1">
            {conversations.map(
              (conversation: {
                id: React.Key | null | undefined;
                last_message: string;
                last_message_at: string;
              }) => (
                <div
                  key={conversation.id}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-indigo-900 transition cursor-pointer ${
                    conversation.id === currentConversationId
                      ? "bg-indigo-900 bg-opacity-10"
                      : ""
                  }`}
                >
                  {/* Content area (clickable for navigation) */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      navigateToConversation(
                        String(conversation.id),
                        {} as React.MouseEvent
                      )
                    }
                  >
                    <p className="text-sm text-white font-medium truncate">
                      {truncateMessage(conversation.last_message)}
                    </p>
                    <p className="text-xs text-gray-300">
                      {formatDate(conversation.last_message_at)}
                    </p>
                  </div>

                  {/* Delete button - separate from the navigation area */}
                  <div className="flex-shrink-0 ml-2">
                    <Tooltip delayDuration={700}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) =>
                            handleDeleteClick(String(conversation.id), e)
                          }
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={15}
                        className="bg-indigo-950"
                      >
                        <p className="text-xs text-white">Delete Chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Custom AlertDialog for delete confirmation */}
      <AlertDialog.Root
        open={!!conversationToDelete}
        onOpenChange={(open) => !open && setConversationToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete Conversation</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};

export default ChatSidebar;
