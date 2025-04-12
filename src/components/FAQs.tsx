
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who can use IskoChatAI?",
    answer: "IskoChatAI is designed for all Filipino students looking for scholarship opportunities. Whether you're a high school student planning for college, a current college student seeking financial aid, or even a graduate student looking for further studies support, our platform can help you find relevant scholarship information."
  },
  {
    question: "Is it free to use?",
    answer: "Yes, IskoChatAI is completely free to use. We believe that access to education information should be available to everyone without any financial barriers. You can ask questions, explore scholarships, and get guidance at no cost."
  },
  {
    question: "How accurate is the information?",
    answer: "IskoChatAI uses a Retrieval-Augmented Generation (RAG) approach to ensure responses are as accurate and up-to-date as possible. We retrieve the latest information from trusted sources such as official scholarship websites, educational institutions, and government agencies in real-time. While we aim to provide reliable guidance, we still recommend verifying important details—like deadlines and requirements—directly with the official scholarship providers."
  },
  {
    question: "Can I apply directly through IskoChatAI?",
    answer: "No, IskoChatAI is an information resource only. We provide details about scholarships and guide you through the application process, but actual applications must be submitted through the official channels specified by each scholarship provider. We do provide direct links to official application portals where available."
  },
  {
    question: "What if a scholarship isn't listed?",
    answer: "While we continuously expand our database, there might be some scholarships that aren't listed yet. If you know of a scholarship that's not in our system, please let us know through our feedback form, and we'll look into adding it. You can also ask IskoChatAI about it – we might have some information even if it's not featured prominently."
  }
];

const FAQs = () => {
  return (
    <section id="faqs" className="isko-section bg-gray-50">
      <div className="isko-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about IskoChatAI and how it can help you with your scholarship search.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto ">
          <Accordion type="single" collapsible className="bg-white rounded-xl shadow-md ">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="px-6 text-left font-medium cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
