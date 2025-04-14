import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedbackForm from '@/components/FeedbackForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const FeedbackPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <main className="flex-grow pt-10 pb-20">
        <div className="isko-container">
          <Link href="/" className="flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">We Value Your Feedback</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help us enhance the IskoChat experience by sharing your thoughts and suggestions
            </p>
          </div>
          
          <FeedbackForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackPage;
