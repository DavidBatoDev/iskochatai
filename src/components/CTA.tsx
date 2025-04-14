import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, MessageSquarePlus } from "lucide-react";
import { InteractiveGridPattern } from "./magicui/interactive-grid-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-800 py-16 relative overflow-hidden">
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
          "will-change-transform"
        )}
        width={45}
        height={45}
        squares={[45, 45]}
        squaresClassName="hover:fill-blue-500 transition-colors duration-300 ease-in-out will-change-opacity"
      />

        <div className="relative flex flex-col justify-center items-center text-center text-white p-5 sm:p-0 w-auto max-w-screen-md mx-auto">          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Perfect Scholarship?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Start chatting with IskoChatAI today and take the first step toward
            funding your education.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" className="isko-button-secondary">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Isko Now
              </Button>
            </Link>
            <Link href="/feedback">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Share Feedback
              </Button>
            </Link>
          </div>
        </div>

    </section>
  );
};

export default CTA;
