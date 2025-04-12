"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { TypeAnimation } from "react-type-animation";

const Hero = () => {
  // State to control message visibility
  const [showUserMessage, setShowUserMessage] = useState(false);
  const [showAiResponse, setShowAiResponse] = useState(false);

  return (
    <section className="min-h-[calc(100vh-72px)] flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-800 py-4">
      <AnimatedGridPattern
        numSquares={70}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(2000px_circle_at_center,white,transparent)]",
          "inset-0 h-full w-full absolute"
        )}
      />
      <div className="isko-container relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-white animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Smart Companion for{" "}
              <span className="text-secondary">Scholarships</span> in the
              Philippines
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Get instant answers, find the right programs, and never miss a
              deadline. Your academic journey begins here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={"/chat"}>
                <Button size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat with Isko Now
                </Button>
              </Link>
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-transform duration-300 ease-in-out hover:scale-105"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Scholarships
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative animate-fade-in">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>
            <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">I</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    IskoChatAI
                  </h3>
                  <p className="text-white/70">Your scholarship assistant</p>
                </div>
              </div>

              {/* AI Initial Message */}
              <div className="bg-white/10 p-3 rounded-lg rounded-bl-none mb-4 mr-auto max-w-[90%]">
                <TypeAnimation
                  sequence={[
                    0,
                    "Kamusta! I'm IskoChatAI. How can I help you with scholarships today?",
                    1000, // Wait for 1 second before showing the user message
                    () => setShowUserMessage(true), // Immediately trigger user message when typing completes
                  ]}
                  wrapper="p"
                  speed={80}
                  className="text-white"
                  cursor={false}
                />
              </div>

              {/* User Message */}
              {showUserMessage && (
                <div className="bg-white/90 p-4 rounded-lg rounded-br-none mb-4 ml-auto max-w-[90%]">
                  <TypeAnimation
                    sequence={[
                      "Anong mga Scholarship ang goods para sa mga engineering?",
                      1000, // Wait for 1 second before showing the AI response
                      () => setShowAiResponse(true), // Immediately trigger AI response when typing completes
                    ]}
                    wrapper="p"
                    speed={80}
                    className="text-primary"
                    cursor={false}
                  />
                </div>
              )}

              {/* AI Response */}
              {showAiResponse && (
                <div className="bg-white/10 p-4 rounded-lg rounded-bl-none mr-auto max-w-[90%]">
                  <TypeAnimation
                    sequence={[
                      "Great question! Para sa mga engineering students, here are some top options: \n\n\u00A0\u00A0\u00A0• DOST-SEI Engineering Scholarship\n\u00A0\u00A0\u00A0• SM Engineering Scholarship\n\u00A0\u00A0\u00A0• CHED Merit Scholarship \n\n Would you like to know more about any of these programs?",
                      1000,
                    ]}
                    wrapper="p"
                    speed={80}
                    className="text-white"
                    style={{ whiteSpace: "pre-line" }}
                    cursor={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
