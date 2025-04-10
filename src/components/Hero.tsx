
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-800 py-20 md:py-32">
      <div className="isko-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-white animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Smart Companion for <span className="text-secondary">Scholarships</span> in the Philippines
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Get instant answers, find the right programs, and never miss a deadline. Your academic journey begins here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="isko-button-secondary" size="lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Isko Now
              </Button>
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" size="lg">
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
                  <h3 className="text-xl font-semibold text-white">IskoChatAI</h3>
                  <p className="text-white/70">Your scholarship assistant</p>
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg mb-4">
                <p className="text-white">Kamusta! I'm IskoChatAI. How can I help you with scholarships today?</p>
              </div>
              <div className="bg-white/90 p-4 rounded-lg mb-4 ml-auto max-w-[80%]">
                <p className="text-primary">Anong mga Scholarship ang goods para sa mga engineering?</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-white">Great question! Para sa mga engineering students, here are some top options:</p>
                <ul className="list-disc pl-5 mt-2 text-white/90">
                  <li>DOST-SEI Engineering Scholarship</li>
                  <li>SM Engineering Scholarship</li>
                  <li>CHED Merit Scholarship</li>
                </ul>
                <p className="mt-2 text-white">Would you like to know more about any of these programs?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
