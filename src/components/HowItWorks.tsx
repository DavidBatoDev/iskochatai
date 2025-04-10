
import React from 'react';
import { MessageCircle, Search, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: <MessageCircle className="w-12 h-12 text-primary" />,
    title: "Ask IskoChatAI your questions",
    description: "Simply type your scholarship inquiries, no matter how complex or simple they may be."
  },
  {
    icon: <Search className="w-12 h-12 text-primary" />,
    title: "Get real-time answers",
    description: "Receive accurate information about scholarships, requirements, and application procedures."
  },
  {
    icon: <Lightbulb className="w-12 h-12 text-primary" />,
    title: "Discover the best opportunities",
    description: "Find personalized scholarship recommendations that match your profile and academic goals."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="isko-section bg-gray-50">
      <div className="isko-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            IskoChatAI makes finding and applying for scholarships simpler than ever before.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 bg-blue-50 p-4 rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
