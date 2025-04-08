import React from "react";
import Link from "next/link";
import { ArrowRight, School, Calendar, FileText } from "lucide-react";

const faqs = [
  {
    question: "How do I apply for scholarships?",
    answer:
      "To apply for scholarships, visit the scholarship page and follow the instructions for each program. You'll need to provide documents like your grades and financial information.",
    icon: <School className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  },
  {
    question: "What documents do I need to apply?",
    answer:
      "You may need documents such as your ID, academic records, recommendation letters, and financial statements, depending on the scholarship program.",
    icon: <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  },
  {
    question: "When is the deadline for applications?",
    answer:
      "The deadlines for scholarships vary. Make sure to check the specific scholarship program for its deadline dates.",
    icon: <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  },
];

export default function FAQSection() {
  return (
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
              <h3 className="text-lg md:text-xl font-bold ml-2 text-black group-hover:text-yellow-300 transition-colors">
                {faq.question}
              </h3>
            </div>
            <p className="text-sm md:text-base text-black">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 md:mt-10">
        <Link href="/faqs">
          <button className="text-blue-100 hover:text-yellow-300 transition-colors text-base md:text-lg font-medium flex items-center gap-1 mx-auto cursor-pointer">
            View all FAQs
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
