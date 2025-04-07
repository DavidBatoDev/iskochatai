import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 md:top-20 left-5 md:left-10 w-12 h-12 md:w-20 md:h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-20 h-20 md:w-32 md:h-32 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute top-20 md:top-40 right-10 md:right-20 w-10 h-10 md:w-16 md:h-16 bg-indigo-300 rounded-full opacity-20 blur-xl"></div>

      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
          Welcome to <span className="text-yellow-400 italic">IskoChat</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed text-blue-100 px-2">
          Helping upcoming college students secure their future with a list of
          scholarships and the best guidance to prepare for the scholarship
          opportunities in the Philippines.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6 w-full max-w-md mx-auto px-4 sm:px-0">
          {/* <Link href="/get-started" className="w-full">
            <button className="w-full bg-yellow-400 text-gray-900 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-yellow-300 hover:scale-105 transition duration-300 shadow-lg flex items-center justify-center gap-2">
              <span className="whitespace-nowrap">Import Profile</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </Link> */}

          <Link href="/chat" className="w-full">
            <button className="w-full bg-white text-slate-900 bg-opacity-20 backdrop-blur-lg border border-white border-opacity-20 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-opacity-30 hover:scale-105 transition duration-300 shadow-lg flex items-center justify-center gap-2">
              <span className="whitespace-nowrap">Chat with IskoBot</span>
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
