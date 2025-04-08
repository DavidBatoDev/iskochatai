"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ChatPage() {
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

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm IskoBot, your chatbot for a better tomorrow. How can I help with your scholarship and college application questions today?",
      usedSearch: false,
      references: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Send a message to our API route which calls Gemini
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
      // Call our API route
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          enableWebSearch: webSearchEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response indicates web search was used
      let responseContent = data.response;
      let usedSearch = data.usedSearch || false;
      const references = data.references || [];

      // If the response starts with [Web Search Used], remove this prefix
      if (responseContent.startsWith("[Web Search Used]")) {
        responseContent = responseContent
          .replace("[Web Search Used]", "")
          .trim();
        usedSearch = true;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        usedSearch: usedSearch,
        references: references,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Error calling API:", error);

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
  const handleKeyDown = (e: {
    key: string;
    shiftKey: any;
    preventDefault: () => void;
  }) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea as content grows or shrinks
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      // Reset height to default before calculating the scrollHeight
      textarea.style.height = "48px";

      if (textarea.value) {
        // If there's text, adjust to content height
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
      }
    };

    // Add event listener for input
    textarea.addEventListener("input", adjustHeight);

    // Initial adjustment and adjust when input state changes
    adjustHeight();

    // Clean up
    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, [input]); // Added input as a dependency to react to its changes

  // Reset chat to initial state
  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi there! I'm IskoBot here to help you in your future. How can I help with your scholarship and college application questions today?",
        usedSearch: false,
        references: [],
      },
    ]);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // When input becomes empty, reset height explicitly
    if (e.target.value === "" && textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }
  };

  // Toggle web search
  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-600 to-indigo-900">
      {/* Header */}
      <header className="bg-indigo-800 bg-opacity-70 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <button className="text-white cursor-pointer hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-white p-2 rounded-md shadow-lg">
                  Back to Home
                </TooltipContent>
              </Tooltip>
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-yellow-400" />
              IskoChat
              <span className="text-xs bg-yellow-400 text-indigo-900 px-2 py-1 rounded-full font-medium ml-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> TechnoQuatro
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 ">
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <button
                  onClick={resetChat}
                  className="text-white cursor-pointer hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </TooltipTrigger>

              <TooltipContent className="bg-white p-2 rounded-md shadow-lg">
                Reset Chat
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] md:max-w-[80%] sm:max-w-[85%] rounded-2xl p-4 shadow-md ${
                  message.role === "user"
                    ? "bg-blue-500 text-black rounded-br-none"
                    : "bg-white bg-opacity-10 backdrop-blur-md text-black rounded-bl-none border border-white border-opacity-20"
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
                      <span className="font-semibold text-black">IskoBot</span>
                      {message.usedSearch && (
                        <span className="flex items-center gap-1 text-xs bg-green-500 text-black px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" /> Web Search
                        </span>
                      )}
                    </>
                  )}
                </div>
                {message.role === "assistant" ? (
                  <div className="markdown-content items-center text-black whitespace-pre-wrap">
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
                              className="bg-indigo-900 bg-opacity-50 text-black px-1 rounded"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-indigo-900 bg-opacity-50 text-black p-2 rounded my-2 overflow-x-auto"
                              {...props}
                            />
                          ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-black whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}

                {/* References Section */}
                {message.role === "assistant" &&
                  message.usedSearch &&
                  message.references &&
                  message.references.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white border-opacity-20">
                      <h4 className="text-sm font-semibold text-black mb-2 flex items-center">
                        <Search className="w-3 h-3 mr-1" /> References
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
                              className="flex items-start text-blue-500 hover:text-yellow-300 transition-colors"
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
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-10 backdrop-blur-md text-black rounded-2xl rounded-bl-none border border-white border-opacity-20 p-4 max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-black">IskoBot</span>
                  {webSearchEnabled && (
                    <span className="flex items-center gap-1 text-xs bg-blue-500 text-black px-2 py-0.5 rounded-full animate-pulse">
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
      <div className="bg-indigo-800 bg-opacity-70 backdrop-blur-md border-t border-white border-opacity-10 p-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 bg-white rounded-2xl">
              {/* Text arae */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about scholarships, applications, deadlines..."
                className="w-full text-black bg-white bg-opacity-10 backdrop-blur-md overflow-hidden rounded-xl border border-white border-opacity-20 p-3 focus:outline-none resize-none min-h-12 max-h-64 placeholder-blue-200"
                style={{
                  height: "48px",
                  transition: "height 0.2s ease",
                }}
              />

              {/* Input size */}
              {input && (
                <div className="absolute right-3 bottom-3 text-xs text-blue-200">
                  {input.length} chars
                </div>
              )}

              <div className="flex items-center pl-4 mb-3">
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
                      className={`block w-14 h-7 rounded-full transition-colors ${
                        webSearchEnabled
                          ? "bg-yellow-400"
                          : "bg-gray-600 group-hover:bg-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between px-1.5 h-full text-xs">
                        <span
                          className={`text-indigo-900 font-medium ${
                            webSearchEnabled ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          ON
                        </span>
                        <span
                          className={`text-white font-medium ${
                            !webSearchEnabled ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          OFF
                        </span>
                      </div>
                    </div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition transform ${
                        webSearchEnabled ? "translate-x-7" : ""
                      } flex items-center justify-center`}
                    >
                      <Globe
                        className={`w-3 h-3 ${
                          webSearchEnabled ? "text-yellow-500" : "text-gray-500"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="ml-2 text-black text-sm flex items-center">
                    Enable Web Search
                  </div>
                </label>
              </div>
            </div>
            {input.trim() !== "" && !isLoading ? (
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    className="rounded-full p-3 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 transition duration-200 cursor-pointer flex items-center justify-center min-w-12 min-h-12"
                  >
                    <Send className="w-5 h-5" />
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
                className="rounded-full p-3 bg-gray-500 cursor-not-allowed flex items-center justify-center min-w-12 min-h-12"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </form>
          <p className="text-xs mt-2 text-center text-white">
            IskoBot might not have all the answers. Please verify important
            information from official sources.
          </p>
        </div>
      </div>
    </div>
  );
}
