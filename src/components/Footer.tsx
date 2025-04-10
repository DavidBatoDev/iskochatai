
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="isko-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">IskoChatAI</h3>
            <p className="text-sm text-gray-400">
              Your smart companion for scholarships in the Philippines. Making education more accessible for Filipino students.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-200 uppercase mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#scholarships" className="text-gray-400 hover:text-white transition-colors">Scholarships</a></li>
              <li><a href="#faqs" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-200 uppercase mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Scholarship Tips</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Application Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} IskoChatAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
