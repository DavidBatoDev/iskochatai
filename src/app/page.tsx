import React from "react";
import HeroSection from "../components/HeroSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
      <HeroSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
