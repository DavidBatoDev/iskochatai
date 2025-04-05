// app/page.tsx
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to <span className="text-yellow-400">IskoChat</span>
        </h1>
        <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto">
          Your chatbot assistant to help upcoming Filipino college students
          access scholarships, document applications, and other government
          services in an interactive and convenient way.
        </p>
        <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full text-xl font-semibold hover:bg-yellow-500 transition duration-300">
          Get Started
        </button>
      </div>
    </div>
  );
}
