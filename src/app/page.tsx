import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Scholarships from "@/components/Scholarships";
import FAQs from "@/components/FAQs";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AnimateOnScroll>
          <Hero />
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <HowItWorks />
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <Scholarships />
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <FAQs />
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.01}>
          <CTA />
        </AnimateOnScroll>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
