'use client'
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ArrowLeft, Bot, User, Sparkles, RotateCcw, Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm IskoBot you chatbot for a better tomorrow. How can I help with your scholarship and college application questions today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send a message to our API route which calls Gemini
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Call our API route
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: "assistant",
        content: data.response,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Error calling API:", error);
      
      const errorMessage = {
        role: "assistant",
        content: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
      };
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("process.env.GEMINI_API_KEY", process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  // Handle pressing Enter to send message
  const handleKeyDown = (e: { key: string; shiftKey: any; preventDefault: () => void; }) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat to initial state
  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi there! I'm IskoBot here to help you in your future. How can I help with your scholarship and college application questions today?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-600 to-indigo-900">
      {/* Header */}
      <header className="bg-indigo-800 bg-opacity-70 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <button className="text-white hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-yellow-400" />
              IskoChat
              <span className="text-xs bg-yellow-400 text-indigo-900 px-2 py-1 rounded-full font-medium ml-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> TechnoQuatro
              </span>
            </h1>
          </div>
          <button 
            onClick={resetChat}
            className="text-white hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            title="Reset conversation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white bg-opacity-10 backdrop-blur-md text-white rounded-bl-none border border-white border-opacity-20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === "user" ? (
                    <>
                      <span className="text-black font-semibold">You</span>
                      <User className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 text-yellow-400" />
                      <span className="text-black font-semibold">IskoBot</span>
                    </>
                  )}
                </div>
                {message.role === "assistant" ? (
                  <div className="markdown-content text-black whitespace-pre-wrap">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold mt-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        a: ({node, ...props}) => <a className="text-yellow-300 hover:underline" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-yellow-400 pl-3 italic my-2" {...props} />,
                        code: ({node, inline, ...props}: {node?: any, inline?: boolean, [key: string]: any}) => 
                          inline 
                            ? <code className="bg-indigo-900 bg-opacity-50 text-white px-1 rounded" {...props} />
                            : <code className="block bg-indigo-900 bg-opacity-50 text-white p-2 rounded my-2 overflow-x-auto" {...props} />
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-black whitespace-pre-wrap">{message.content}</p>
                )}
                
                {message.role === "assistant" && (
                  <button 
                    className="mt-2 text-blue-200 hover:text-yellow-300 text-xs flex items-center gap-1 transition-colors"
                    onClick={() => navigator.clipboard.writeText(message.content)}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-10 backdrop-blur-md text-white rounded-2xl rounded-bl-none border border-white border-opacity-20 p-4 max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold">IskoBot</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about scholarships, applications, deadlines..."
              className="flex-1 text-black bg-white bg-opacity-10 backdrop-blur-md overflow-hidden rounded-xl border border-white border-opacity-20 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-12 max-h-32 placeholder-blue-200"
              style={{ minHeight: "48px" }}
            />
            <button
              type="submit"
              disabled={input.trim() === "" || isLoading}
              className={`rounded-full p-3 ${
                input.trim() === "" || isLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-indigo-900"
              } transition duration-200 cursor-pointer`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs mt-2 text-center text-blue-200">
            IskoBot might not have all the answers. Please verify important information from official sources.
          </p>
        </div>
      </div>
    </div>
  );
}