export const metadata = {
  title: "IskoChatAI | Your Scholarship Companion",
  description:
    "Helping Filipino students discover and apply for scholarships with real-time AI assistance.",
  openGraph: {
    title: "IskoChatAI | Your Scholarship Companion",
    description:
      "Helping Filipino students discover and apply for scholarships with real-time AI assistance.",
    url: "https://scholarship-helper.vercel.app",
    siteName: "IskoChatAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IskoChatAI Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IskoChatAI | Your Scholarship Companion",
    description:
      "Helping Filipino students discover and apply for scholarships.",
    images: ["/og-image.png"],
  },
};

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Scholarships from '@/components/Scholarships';
import FAQs from '@/components/FAQs';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Scholarships />
        <FAQs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
