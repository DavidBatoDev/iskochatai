// app/dashboard/chat/[id]/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Send,
  ArrowLeft,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Copy,
  Search,
  Globe,
  ExternalLink,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  GraduationCap,
  Award,
  FileQuestion,
  Menu,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth";
import ChatSidebar from "@/components/ChatSidebar";
import { useConversationsStore } from "@/lib/conversationStore";
import { getAuthHeaders } from "@/lib/api";
import ChatHeader from "@/components/chat-ui/ChatHeader";
import {
  ProfileAction,
  SignOutAction,
} from "@/components/chat-ui/HeaderActions";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  interface Reference {
    title?: string;
    url: string;
  }

  interface Message {
    role: "user" | "assistant";
    content: string;
    usedSearch: boolean;
    references: Reference[];
  }

  interface Conversation {
    id: string;
    last_message: string;
    last_message_at: string;
    is_active: boolean;
  }

  const { user, isAuthenticated, session, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setCurrentConversationId } = useConversationsStore();

  // // Check first if there is a valid user, session and authenticated
  // useEffect(() => {
  //   if (!isAuthenticated || !user || !session) {
  //     router.push("/signin");
  //   }
  // }, [isAuthenticated, user, session, router]);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Default open on larger screens
      } else {
        setSidebarOpen(false); // Default closed on mobile
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch messages for the current conversation
  useEffect(() => {
    // Fetch messages only if conversationId is valid
    const fetchMessages = async () => {
      if (!conversationId || conversationId === "new") {
        // Reset to default welcome message for new conversations
        setMessages([]);
        return;
      }

      try {
        setIsFetchingMessages(true);
        const headers = await getAuthHeaders();

        // Add user ID as query parameter as a backup
        const url = `/api/chat/${conversationId}${
          user?.id ? `?userId=${user.id}` : ""
        }`;

        const response = await fetch(url, {
          headers,
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            // Transform the data format to match our Message interface
            const formattedMessages = data.messages.map((msg: any) => ({
              role: msg.role,
              content: msg.message, // Use message field from our API response
              usedSearch: msg.used_search || false,
              references: msg.references || [],
            }));
            setMessages(formattedMessages);
          }
        } else {
          console.error("Failed to fetch messages:", response.status);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsFetchingMessages(false);
      }
    };

    fetchMessages();
  }, [conversationId, user?.id]);

  useEffect(() => {
    setCurrentConversationId(conversationId);
  }, [conversationId, setCurrentConversationId]);

  // Send a message
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      role: "user",
      content: input,
      usedSearch: false,
      references: [],
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }

    try {
      // For new conversations, create a new one
      let chatId = conversationId;
      if (chatId === "new") {
        // Create new conversation
        const createResponse = await fetch("/api/conversations", {
          method: "POST",
          headers: await getAuthHeaders(),
        });

        if (createResponse.ok) {
          const data = await createResponse.json();
          chatId = data.id;
          // Navigate to the new conversation URL
          // router.push(`/dashboard/chat/${chatId}`);
          // Just update the URL without a full navigation reload
          window.history.pushState({}, '', `/dashboard/chat/${chatId}`);
        } else {
          throw new Error(
            `Failed to create conversation: ${createResponse.status}`
          );
        }
      }

      // Call our chat API
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          messages: newMessages,
          enableWebSearch: webSearchEnabled,
          conversationId: chatId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // If this was a new conversation, update the state
      if (conversationId === "new") {
        // Update router without causing a navigation/reload
        router.replace(`/dashboard/chat/${data.conversationId}`, { scroll: false });
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        usedSearch: data.usedSearch || false,
        references: data.references || [],
      };

      setMessages([...newMessages, assistantMessage]);

      setIsLoading(false);

      // Refresh the conversations list to show the updated last message
      const convoResponse = await fetch("/api/conversations", {
        headers: await getAuthHeaders(),
      });
      if (convoResponse.ok) {
        const convoData = await convoResponse.json();
        setConversations(convoData);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        usedSearch: false,
        references: [],
      };

      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle sign out with timeout
  const handleSignOut = async () => {
    setIsSigningOut(true);
    console.log("Signing out...");
    
    // Create a timeout that will force the loading state to end after 10 seconds
    const timeoutId = setTimeout(() => {
      alert("Sign out timeout reached (10s)");
      setIsSigningOut(false);
      window.location.reload();
    }, 10000); // 10 seconds
    
    try {
      // Try to sign out properly
      await signOut();
      console.log("User signed out successfully");
      
      // If successful, clear the timeout and navigate
      clearTimeout(timeoutId);
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      
      // If error occurs, also clear timeout and reset loading state
      clearTimeout(timeoutId);
      setIsSigningOut(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "48px";
      if (textarea.value) {
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
      }
    };

    textarea.addEventListener("input", adjustHeight);
    adjustHeight(); // Initial adjustment

    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, [input]);

  // Create a new chat
  const createNewChat = () => {
    router.push("/dashboard/chat/new");
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Close sidebar on mobile after creating new chat
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      if (response.ok) {
        // Remove from list
        setConversations(conversations.filter((convo) => convo.id !== id));
        useConversationsStore.getState().removeConversation(id);

        // If the deleted conversation is the current one, redirect to a new chat
        if (id === conversationId) {
          router.push("/dashboard/chat/new");
        }
      } else {
        console.error("Failed to delete conversation:", response.status);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Reset current chat
  const resetChat = async () => {
    if (conversationId && conversationId !== "new") {
      try {
        const response = await fetch(`/api/chat/${conversationId}/reset`, {
          method: "PATCH",
          headers: await getAuthHeaders(),
        });

        if (response.ok) {
          // Reset the UI
          setMessages([
            {
              role: "assistant",
              content:
                "Hello Isko/Iska! I'm IskoBotAI, your chatbot para sa magandang kinabukasan. How can I help with your scholarship and college application questions today?",
              usedSearch: false,
              references: [],
            },
          ]);
        } else {
          console.error("Failed to reset chat:", response.status);
        }
      } catch (error) {
        console.error("Error resetting chat:", error);
      }
    } else {
      // For new conversations, just reset the UI
      setMessages([
        {
          role: "assistant",
          content:
            "Hello Isko/Iska! I'm IskoBotAI, your chatbot para sa magandang kinabukasan. How can I help with your scholarship and college application questions today?",
          usedSearch: false,
          references: [],
        },
      ]);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // When input becomes empty, reset height
    if (e.target.value === "" && textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }
  };

  // Toggle web search
  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  // Empty chat placeholder suggestions
  const suggestions = [
    {
      icon: <BookOpen className="w-5 h-5 text-yellow-400" />,
      text: "What scholarships are available for Computer Science students?",
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-yellow-400" />,
      text: "How do I apply for SM Scholarship?",
    },
    {
      icon: <Award className="w-5 h-5 text-yellow-400" />,
      text: "What are the requirements for DOST scholarship?",
    },
    {
      icon: <FileQuestion className="w-5 h-5 text-yellow-400" />,
      text: "When is the DOST application deadline?",
    },
  ];

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && sidebarOpen) {
        // Check if click was outside sidebar
        const sidebar = document.getElementById('chat-sidebar');
        const toggleButton = document.getElementById('sidebar-toggle');
        if (sidebar && 
            !sidebar.contains(event.target as Node) && 
            toggleButton && 
            !toggleButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-600 to-indigo-800 overflow-hidden">
      {/* Sidebar Overlay - only visible on mobile when sidebar is open */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <div
        id="chat-sidebar"
        className={`fixed top-0 left-0 z-20 h-full transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <ChatSidebar
          sidebarOpen={sidebarOpen}
          createNewChat={createNewChat}
          deleteConversation={deleteConversation}
        />
      </div>

      {/* Toggle Sidebar Button */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 bg-indigo-800 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-md transition-all duration-300 md:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <ChatHeader
          className="px-4 md:px-40 py-4"
          rightActions={[
            <ProfileAction key="profile" />,
            <SignOutAction
              key="signout"
              onClick={handleSignOut}
              isLoading={isSigningOut}
            />,
          ]}
        />
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 md:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Loading spinner when fetching messages */}
            {isFetchingMessages && (
              <div className="flex justify-center items-center h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">Loading conversation...</p>
                </div>
              </div>
            )}

            {/* Messages list */}
            {!isFetchingMessages && messages.length > 0 && messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[95%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl p-3 sm:p-4 shadow-md ${
                    message.role === "user"
                      ? "bg-white text-black rounded-br-none"
                      : "bg-blue-500 bg-opacity-10 backdrop-blur-md text-black rounded-bl-none border border-white border-opacity-20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === "user" ? (
                      <>
                        <span className="font-semibold text-black">You</span>
                        <User className="w-4 h-4 text-black" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-yellow-400" />
                        <span className="font-semibold text-white">
                          IskoBot
                        </span>
                        {message.usedSearch && (
                          <span className="flex items-center gap-1 text-xs bg-green-500 text-black px-2 py-0.5 rounded-full">
                            <Globe className="w-3 h-3" /> Web Search
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {message.role === "assistant" ? (
                    <div className="markdown-content items-center text-white text-xs md:text-sm whitespace-pre-wrap sm:text-base">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-xl font-bold mt-[-40px]"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-lg font-bold mt-[-40px]"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-md font-bold mt-[-20px]"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-[-10px]" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal pl-5 items-center"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc pl-5 items-start"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              className="align-baseline mt-[-20px]"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              target="_blank"
                              className="text-yellow-300 hover:underline"
                              {...props}
                            />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-yellow-400 pl-3 italic my-2"
                              {...props}
                            />
                          ),
                          code: ({
                            node,
                            inline,
                            ...props
                          }: {
                            node?: any;
                            inline?: boolean;
                            [key: string]: any;
                          }) =>
                            inline ? (
                              <code
                                className="bg-indigo-900 bg-opacity-50 text-white px-1 rounded"
                                {...props}
                              />
                            ) : (
                              <code
                                className="block bg-indigo-900 bg-opacity-50 text-white p-2 rounded my-2 overflow-x-auto text-xs sm:text-sm"
                                {...props}
                              />
                            ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-black whitespace-pre-wrap text-xs md:text-sm sm:text-base">
                      {message.content}
                    </p>
                  )}

                  {/* References Section */}
                  {message.role === "assistant" &&
                    message.usedSearch &&
                    message.references &&
                    message.references.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white border-opacity-20">
                        <h4 className="text-sm font-semibold text-secondary mb-2 flex items-center">
                          <Search className="w-3 h-3 mr-1 text-secondary" />{" "}
                          References
                        </h4>
                        <ul className="space-y-2">
                          {message.references.map((reference, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-black break-words"
                            >
                              <a
                                href={reference.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start text-blue-200 hover:text-yellow-300 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{reference.title || reference.url}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {message.role === "assistant" && (
                    <button
                      className="text-blue-200 hover:text-yellow-300 mt-10 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      onClick={() =>
                        navigator.clipboard.writeText(message.content)
                      }
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty chat placeholder with suggestions */}
            {!isFetchingMessages && messages.length === 0 && (
              <div className="flex justify-center items-center h-[400px]">
                <div className="rounded-2xl max-w-[100%] px-2">
                  <div className="text-center mb-6">
                    <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Welcome to IskoBot AI
                    </h2>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Your AI assistant for scholarship and college application
                      guidance
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="cursor-pointer flex items-start p-3 sm:p-4 bg-indigo-800 hover:bg-indigo-800/50 bg-opacity-40 rounded-lg  transition text-left"
                        onClick={() => {
                          setInput(suggestion.text);
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                      >
                        <div className="mr-2 sm:mr-3 mt-1">
                          {suggestion.icon}
                        </div>
                        <p className="text-white text-xs sm:text-sm">
                          {suggestion.text}
                        </p>
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-xs text-blue-200 mt-4 sm:mt-6">
                    You can ask any questions about scholarships, college applications, or educational opportunities
                  </p>
                </div>
              </div>
            )}

            {/* Bot is typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white bg-opacity-10 backdrop-blur-md text-black rounded-2xl rounded-bl-none border border-white border-opacity-20 p-3 sm:p-4 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold text-white">IskoBot</span>
                    {webSearchEnabled && (
                      <span className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                        <Search className="w-3 h-3" /> Searching...
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-blue-300 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-blue-300 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-blue-300 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-transparent bg-opacity-70 backdrop-blur-md p-2 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 bg-white rounded-2xl">
                {/* Text area */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about scholarships, applications, deadlines..."
                  className="placeholder:text-xs md:placeholder:text-sm text-xs md:text-sm w-full text-black bg-white bg-opacity-10 backdrop-blur-md overflow-hidden rounded-xl border border-white border-opacity-20 p-2 sm:p-3 focus:outline-none resize-none min-h-12 max-h-64 placeholder-blue-200 sm:text-base"
                  style={{
                    height: "48px",
                    transition: "height 0.2s ease",
                  }}
                />

                {/* Web search toggle */}
                <div className="flex items-center pl-3 sm:pl-4 mb-2 sm:mb-3">
                  <label
                    htmlFor="webSearchToggle"
                    className="flex items-center cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="webSearchToggle"
                        className="sr-only"
                        checked={webSearchEnabled}
                        onChange={toggleWebSearch}
                      />
                      <div
                        className={`block w-10 sm:w-14 h-5 sm:h-7 rounded-full transition-colors ${
                          webSearchEnabled
                            ? "bg-yellow-400"
                            : "bg-gray-600 group-hover:bg-gray-500"
                        }`}
                      >
                        <div className="flex items-center justify-between px-1.5 h-full text-xs">
                          <span
                            className={`text-indigo-900 font-medium ${
                              webSearchEnabled ? "opacity-100" : "opacity-0"
                            } hidden sm:inline`}
                          >
                            ON
                          </span>
                          <span
                            className={`text-white font-medium ${
                              !webSearchEnabled ? "opacity-100" : "opacity-0"
                            } hidden sm:inline`}
                          >
                            OFF
                          </span>
                        </div>
                      </div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-3 h-3 sm:w-5 sm:h-5 rounded-full shadow-md transition transform ${
                          webSearchEnabled
                            ? "translate-x-5 sm:translate-x-7"
                            : ""
                        } flex items-center justify-center`}
                      >
                        <Globe
                          className={`w-2 h-2 sm:w-3 sm:h-3 ${
                            webSearchEnabled
                              ? "text-yellow-500"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="ml-2 text-black text-xs sm:text-sm flex items-center">
                      Web Search
                    </div>
                  </label>
                </div>
              </div>
              {input.trim() !== "" && !isLoading ? (
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      className="rounded-full p-2 sm:p-3 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 transition duration-200 cursor-pointer flex items-center justify-center min-w-10 min-h-10 sm:min-w-12 sm:min-h-12"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white p-2 rounded-md shadow-lg">
                    Send
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  type="submit"
                  disabled
                  className="rounded-full p-2 sm:p-3 bg-gray-500 cursor-not-allowed flex items-center justify-center min-w-10 min-h-10 sm:min-w-12 sm:min-h-12"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </form>
            <p className="text-xs mt-2 text-center text-white px-2">
              IskoBot might not have all the answers. Please verify important
              information from official sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
