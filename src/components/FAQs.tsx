
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
  },
  {
    question: "How can I know which scholarships I'm eligible for?",
    answer: "IskoChatAI can help filter scholarships based on your academic background, field of study, location, and other criteria. Simply ask about scholarships for your specific situation, and our AI will suggest opportunities you're likely eligible for. You can ask questions like 'What scholarships are available for engineering students in Manila?' or 'What scholarships can I apply for as a HUMSS student?'"
  },
  {
    question: "Can I get notified about new scholarship opportunities?",
    answer: "Currently, we don't offer automatic notifications, but we regularly update our database with new scholarships. We recommend checking back frequently or following our social media channels where we announce major scholarship opportunities. We're working on adding a notification feature in the future."
  },
    {
    question: "How is my chat data handled?",
    answer: "We prioritize your privacy. Chat conversations are used only to improve the quality of our responses and are not shared with third parties. We don't store personally identifiable information unless explicitly provided, and you can request deletion of your chat history at any time."
  },
  {
    question: "What should I do if IskoChatAI isn't working correctly?",
    answer: "If you encounter any technical issues, try refreshing your browser first. If problems persist, you can report the issue through our feedback form with details about what happened. Our team regularly monitors these reports and works to resolve issues quickly."
  },
  {
    question: "Can IskoChatAI help me with my scholarship application?",
    answer: "Absolutely! You can ask for guidance on writing scholarship essays, preparing for interviews, gathering required documents, and other aspects of the application process. While we provide general advice, we encourage you to personalize our suggestions to reflect your unique experiences and qualifications."
  },
  
  {
    question: "How can I provide feedback about IskoChatAI?",
    answer: "We welcome your feedback! You can share your thoughts, suggestions, or any issues you encounter through our feedback form. Your input helps us improve the platform and provide a better experience for all users."
  },
  {
    question: "Is there a mobile app for IskoChatAI?",
    answer: "Currently, IskoChatAI is available as a web application. We are exploring the possibility of developing a mobile app in the future to enhance accessibility. For now, you can access IskoChatAI through any mobile browser."
  },
  {
    question: "Can IskoChatAI recommend universities as well?",
    answer: "Yes! IskoChatAI can help you discover top universities in the Philippines based on your preferred course, location, budget, and even available scholarships. You can ask questions like 'What are the best universities for engineering in Luzon?' or 'Which schools offer full scholarships for IT programs?'"
  },
  {
    question: "Does IskoChatAI cover both public and private institutions?",
    answer: "Absolutely. We provide information about scholarships and programs offered by both public universities like UP, PUP, and state colleges, as well as private institutions like Ateneo, La Salle, Mapua, and many more."
  },
  {
    question: "Can I save my profile on IskoChatAI?",
    answer: "Yes. If you log in, you can create and save a profile that allows IskoChatAI to give you more personalized recommendations based on your academic history, interests, and scholarship goals."
  },
  {
    question: "Can IskoChatAI help me choose a course?",
    answer: "Definitely. If you're unsure about what course to take, you can ask IskoChatAI for guidance based on your interests, future job goals, and scholarship availability. We can also suggest in-demand courses in the Philippines and globally."
  },
  {
    question: "Is IskoChatAI available 24/7?",
    answer: "Yes! IskoChatAI is an AI-powered assistant available 24/7 to answer your questions, guide your scholarship search, and help you explore universities anytime, anywhere."
  },
  {
    question: "Does IskoChatAI support Filipino language?",
    answer: "Oo naman! You can chat with IskoChatAI in Filipino, English, or Taglish. We designed it to feel like you’re talking to a friendly, helpful upperclassman who understands you."
  },
  {
    question: "How often is the data updated?",
    answer: "We update our scholarship and university listings regularly. IskoChatAI uses a smart retrieval system that fetches the most recent data from official sources and trusted partners in real time."
  },
  {
    question: "Can I use IskoChatAI even if I'm already in college?",
    answer: "Of course! IskoChatAI is not just for incoming freshmen. We also help current college students and even graduating students find scholarships for continuing education, internships, and graduate studies."
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
