// components/chat-ui/HeaderActions.tsx
import React from "react";
import Link from "next/link";
import { RotateCcw, UserCircle, LogOut, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Reset chat button with tooltip
 */
export const ResetChatAction: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Tooltip delayDuration={700}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="text-black cursor-pointer hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10"
          aria-label="Reset chat"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-white p-2 rounded-md shadow-lg">
        Reset Chat
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Profile link action with tooltip
 */
export const ProfileAction: React.FC = () => {
  return (
    <Tooltip delayDuration={700}>
      <TooltipTrigger asChild>
        <Link href="/profile">
          <button
            className="text-black cursor-pointer hover:text-yellow-300 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            aria-label="View profile"
          >
            <UserCircle className="w-5 h-5" />
          </button>
        </Link>
      </TooltipTrigger>
      <TooltipContent className="bg-white p-2 rounded-md shadow-lg">
        Profile
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Sign out button with tooltip and loading state
 */
export const SignOutAction: React.FC<{ 
  onClick: () => void;
  isLoading?: boolean;
}> = ({ onClick, isLoading = false }) => {
  return (
    <Tooltip delayDuration={700}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading}
          className="text-black cursor-pointer hover:text-red-500 transition p-2 rounded-full hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
          aria-label="Sign out"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-white p-2 rounded-md shadow-lg">
        {isLoading ? "Signing Out..." : "Sign Out"}
      </TooltipContent>
    </Tooltip>
  );
};