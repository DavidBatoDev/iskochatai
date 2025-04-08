import React from "react";

export default function Footer() {
  return (
    <footer className="bg-indigo-900 bg-opacity-50 py-4 md:py-6 mt-6 md:mt-10 z-20">
      <div className="container mx-auto px-4 text-center text-blue-200 text-xs md:text-sm z-10">
        <p>
          &copy; {new Date().getFullYear()} IskoChat. Helping students achieve
          their academic dreams.
        </p>
      </div>
    </footer>
  );
}
