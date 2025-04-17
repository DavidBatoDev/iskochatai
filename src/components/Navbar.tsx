"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  // Function to handle smooth scrolling
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 72; // Your navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };
  return (
    <nav className="backdrop-blur-md bg-white/60 border-b border-white/20 shadow-sm sticky top-0 z-50 h-[72px]">
      <div className="isko-container py-4">
        <div className="flex items-center justify-between">
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "hero")}
            className="flex items-center gap-2 group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <img
              src="/icon-nobg.png"
              alt="icon-logo"
              className="size-10 transition-transform group-hover:rotate-3"
            />
            <span className="text-2xl font-bold text-primary transition-colors group-hover:text-primary/90">
              Isko
              <span className="text-secondary group-hover:text-secondary/90">
                Chat
              </span>
              AI
            </span>
          </a>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="text-gray-700 hover:text-primary transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              How It Works
            </a>
            <a
              href="#scholarships"
              onClick={(e) => scrollToSection(e, "scholarships")}
              className="text-gray-700 hover:text-primary transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Scholarships
            </a>
            <a
              href="#faqs"
              onClick={(e) => scrollToSection(e, "faqs")}
              className="text-gray-700 hover:text-primary transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              FAQs
            </a>
          </div>
          <Link href={"/chat"} className="hidden md:block">
            <Button className="cursor-pointer bg-primary/90 backdrop-blur-sm hover:bg-primary/80 text-white border border-white/20">
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
