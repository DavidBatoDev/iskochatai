"use client";

import React from "react";
import HeroSection from "../components/HeroSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";
import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";

export default function Home() {
  return (
    <div className="min-h-screen relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
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
      <div className="relative z-10">
        <HeroSection />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
