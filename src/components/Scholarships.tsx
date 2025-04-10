
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, GraduationCap, Calendar } from 'lucide-react';

const scholarships = [
  {
    name: "DOST-SEI Scholarship",
    provider: "Department of Science and Technology",
    description: "Merit-based scholarships for students pursuing science, technology, engineering and mathematics courses.",
    eligibility: "Top 5% of graduating class, Filipino citizen",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-blue-50"
  },
  {
    name: "CHED Scholarship",
    provider: "Commission on Higher Education",
    description: "Financial assistance programs for deserving students in both public and private higher education institutions.",
    eligibility: "Must be Filipino, academically skilled, in financial need",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-green-50"
  },
  {
    name: "SM Foundation Scholarship",
    provider: "SM Foundation",
    description: "Comprehensive college scholarship program covering tuition, monthly allowance, and other benefits.",
    eligibility: "From economically challenged families, excellent academic record",
    icon: <Users className="w-12 h-12 text-primary" />,
    color: "bg-yellow-50"
  },
  {
    name: "Megaworld Foundation",
    provider: "Megaworld Corporation",
    description: "Full academic scholarship including tuition, miscellaneous fees, and monthly allowance.",
    eligibility: "High academic achievers with leadership potential",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-purple-50"
  },
  {
    name: "Jollibee Group Foundation",
    provider: "Jollibee Foods Corporation",
    description: "Scholarships for children of JFC employees and selected underprivileged students.",
    eligibility: "Children of JFC employees, financially challenged students",
    icon: <Users className="w-12 h-12 text-primary" />,
    color: "bg-red-50"
  },
  {
    name: "Ayala Foundation",
    provider: "Ayala Corporation",
    description: "Scholarships that cover tuition fees, monthly stipend, and leadership training programs.",
    eligibility: "Outstanding academic records, leadership qualities",
    icon: <Calendar className="w-12 h-12 text-primary" />,
    color: "bg-indigo-50"
  }
];

const Scholarships = () => {
  return (
    <section id="scholarships" className="isko-section">
      <div className="isko-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Scholarships</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top scholarship opportunities available for Filipino students across different fields of study.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scholarships.map((scholarship, index) => (
            <div key={index} className="isko-card">
              <div className={`${scholarship.color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="bg-white rounded-lg p-3">
                    {scholarship.icon}
                  </div>
                  <span className="text-xs font-medium bg-white px-3 py-1 rounded-full text-primary">
                    Popular
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{scholarship.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Provided by {scholarship.provider}</p>
                <p className="text-gray-600 mb-4">{scholarship.description}</p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Eligibility:</h4>
                  <p className="text-sm text-gray-600">{scholarship.eligibility}</p>
                </div>
                <Button variant="outline" className="w-full">
                  Learn More <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Scholarships;
