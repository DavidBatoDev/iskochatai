
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 h-[72px]">
      <div className="isko-container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Isko<span className="text-secondary">Chat</span>AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-primary transition-colors">How It Works</a>
            <a href="#scholarships" className="text-gray-700 hover:text-primary transition-colors">Scholarships</a>
            <a href="#faqs" className="text-gray-700 hover:text-primary transition-colors">FAQs</a>
          </div>
          <Link href={'/chat'} className="hidden md:block">
            <Button className="bg-primary cursor-pointer hover:bg-isko-blue-dark text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with Isko
            </Button>   
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
