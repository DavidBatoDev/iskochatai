import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, School, Calendar, FileText } from "lucide-react";

const faqs = [
  {
    question: "How do I apply for scholarships?",
    answer: "To apply for scholarships, visit the scholarship page and follow the instructions for each program. You'll need to provide documents like your grades and financial information.",
    icon: <School className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  },
  {
    question: "What documents do I need to apply?",
    answer: "You may need documents such as your ID, academic records, recommendation letters, and financial statements, depending on the scholarship program.",
    icon: <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  },
  {
    question: "When is the deadline for applications?",
    answer: "The deadlines for scholarships vary. Make sure to check the specific scholarship program for its deadline dates.",
    icon: <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
      {/* Hero Section with improved visual elements */}
      <div className="relative overflow-hidden">
        {/* Decorative elements - adjusted for better mobile visibility */}
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-12 h-12 md:w-20 md:h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-20 h-20 md:w-32 md:h-32 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-20 md:top-40 right-10 md:right-20 w-10 h-10 md:w-16 md:h-16 bg-indigo-300 rounded-full opacity-20 blur-xl"></div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
            Welcome to <span className="text-yellow-400 italic">IskoChat</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed text-blue-100 px-2">
            Helping upcoming college students secure their future with a list of scholarships and the best guidance to prepare for the scholarship oppurtunities in the Philippines.
          </p>
          
          {/* Action buttons with better mobile layout */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6 w-full max-w-md mx-auto px-4 sm:px-0">
            <Link href="/get-started" className="w-full">
              <button className="w-full bg-yellow-400 text-gray-900 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-yellow-300 hover:scale-105 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                <span className="whitespace-nowrap">Import Profile</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </Link>
            
            <Link href="/chat" className="w-full">
              <button className="w-full bg-white text-slate-900 bg-opacity-20 backdrop-blur-lg border border-white border-opacity-20 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-opacity-30 hover:scale-105 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                <span className="whitespace-nowrap">Chat with IskoBot</span>
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section with improved mobile layout */}
      <div className="max-w-5xl w-full mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-white">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 border border-white border-opacity-20 hover:bg-opacity-20 group"
            >
              <div className="flex items-start md:items-center mb-3 md:mb-4">
                <div className="mt-1 md:mt-0">{faq.icon}</div>
                <h3 className="text-lg md:text-xl font-bold ml-2 text-black group-hover:text-yellow-300 transition-colors">{faq.question}</h3>
              </div>
              <p className="text-sm md:text-base text-black">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        {/* Additional FAQ link */}
        <div className="text-center mt-8 md:mt-10">
          <Link href="/faqs">
            <button className="text-blue-100 hover:text-yellow-300 transition-colors text-base md:text-lg font-medium flex items-center gap-1 mx-auto">
              View all FAQs
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-900 bg-opacity-50 py-4 md:py-6 mt-6 md:mt-10">
        <div className="container mx-auto px-4 text-center text-blue-200 text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} IskoChat. Helping students achieve their academic dreams.</p>
        </div>
      </footer>
    </div>
  );
}