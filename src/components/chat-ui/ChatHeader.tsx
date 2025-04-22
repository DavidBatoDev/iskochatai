// components/chat-ui/ChatHeader.tsx
import React from "react";
import Link from "next/link";
import { Bot, Sparkles, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  /**
   * Right-side actions to be rendered in the header
   */
  rightActions?: React.ReactNode;
  /**
   * Back link path (defaults to home)
   */
  backLink?: string;
  /**
   * Additional class names for styling
   */
  className?: string;
}

/**
 * Reusable chat header component that shows the brand and allows for custom right-side actions
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  rightActions,
  backLink = "/",
  className,
}) => {
  return (
    <header className="bg-white bg-opacity-70 backdrop-blur-md shadow-md z-10">
      <div className={"container mx-auto flex justify-between items-center" + className}>
        <div className="flex items-center gap-2">
          <Link href={backLink}>
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <button className="text-primary cursor-pointer hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary p-2 rounded-md shadow-lg z-20">
                {backLink === "/" ? "Back to Home" : "Go Back"}
              </TooltipContent>
            </Tooltip>
          </Link>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Bot className="w-6 h-6 text-secondary" />
            <div>
              Isko<span className="text-secondary">Chat</span>Ai
            </div>
            <span className="hidden md:flex text-xs bg-secondary text-indigo-900 px-2 py-1 rounded-full font-medium ml-2 items-center">
              <Sparkles className="w-3 h-3 mr-1" /> TechnoQuatro
            </span>
          </h1>
        </div>
        {rightActions && <div className="flex items-center gap-3">{rightActions}</div>}
      </div>
    </header>
  );
};

export default ChatHeader;