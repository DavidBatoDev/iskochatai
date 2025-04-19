'use client'
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, GraduationCap, Calendar, Building, BookOpen, Award, Flag } from "lucide-react";

const scholarships = [
  {
    name: "DOST-SEI Scholarship",
    provider: "Department of Science and Technology",
    description:
      "Merit-based scholarships for students pursuing science, technology, engineering and mathematics courses.",
    eligibility: "Top 5% of graduating class, Filipino citizen",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-blue-50",
    link:"https://www.science-scholarships.ph/",
  },
  {
    name: "CHED Scholarship",
    provider: "Commission on Higher Education",
    description:
      "Financial assistance programs for deserving students in both public and private higher education institutions.",
    eligibility: "Must be Filipino, academically skilled, in financial need",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-green-50",
    link:"https://ched.gov.ph/merit-scholarship/",
  },
  {
    name: "SM Foundation Scholarship",
    provider: "SM Foundation",
    description:
      "Comprehensive college scholarship program covering tuition, monthly allowance, and other benefits.",
    eligibility:
      "From economically challenged families, excellent academic record",
    icon: <Users className="w-12 h-12 text-primary" />,
    color: "bg-yellow-50",
    link:"https://www.sm-foundation.org/what_we_do/college-scholarship-program/#sm-college-scholarship",
  },
  {
    name: "Megaworld Foundation",
    provider: "Megaworld Corporation",
    description:
      "Full academic scholarship including tuition, miscellaneous fees, and monthly allowance.",
    eligibility: "High academic achievers with leadership potential",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-purple-50",
    link:"https://www.megaworldfoundation.com/scholarship_program",
  },
  {
    name: "Jollibee Group Foundation",
    provider: "Jollibee Foods Corporation",
    description:
      "Scholarships for children of JFC employees and selected underprivileged students.",
    eligibility: "Children of JFC employees, financially challenged students",
    icon: <Users className="w-12 h-12 text-primary" />,
    color: "bg-red-50",
    link:"https://foundation.jollibeegroup.com/programs/access-curriculum-employability",
  },
  {
    name: "Ayala Foundation",
    provider: "Ayala Corporation",
    description:
      "Scholarships that cover tuition fees, monthly stipend, and leadership training programs.",
    eligibility: "Outstanding academic records, leadership qualities",
    icon: <Calendar className="w-12 h-12 text-primary" />,
    color: "bg-indigo-50",
    link: "https://www.ayalafoundation.org/program/u-go-scholar-grant/"
  },
];

const universities = [
  {
    name: "University of the Philippines",
    location: "Multiple Campuses",
    description: 
    "The country's national university known for academic excellence and research contributions across various disciplines.",
    specialization: "Comprehensive, strong in liberal arts, sciences, and professional programs",
    icon: <BookOpen className="w-12 h-12 text-primary" />,
    color: "bg-red-50",
    link: "https://up.edu.ph/",
  },
  {
    name: "Polytechnic University of the Philippines",
    location: "Multiple Campuses",
    description:
      "A state university known for its affordable education and strong emphasis on technical and vocational training.",
    specialization: "Engineering, Business, Information Technology",
    icon: <Users className="w-12 h-12 text-primary" />,
    color: "bg-purple-50",
    link: "https://www.pup.edu.ph/",
  },
  {
    name: "Ateneo de Manila University",
    location: "Quezon City",
    description:
      "A private Jesuit university known for its strong liberal arts tradition and business programs.",
    specialization: "Business, Humanities, Social Sciences, Law",
    icon: <Award className="w-12 h-12 text-primary" />,
    color: "bg-blue-50",
    link: "https://www.ateneo.edu/",
  },
  {
    name: "De La Salle University",
    location: "Manila",
    description:
      "A private Catholic research university known for its business and engineering programs.",
    specialization: "Business, Engineering, Education",
    icon: <Flag className="w-12 h-12 text-primary" />,
    color: "bg-green-50",
    link: "https://www.dlsu.edu.ph/",
  },
  {
    name: "University of Santo Tomas",
    location: "Manila",
    description:
      "The oldest existing university in Asia, known for its programs in healthcare and the arts.",
    specialization: "Medicine, Architecture, Arts and Letters",
    icon: <Building className="w-12 h-12 text-primary" />,
    color: "bg-yellow-50",
    link: "https://www.ust.edu.ph/",
  },
  {
    name: "Mapúa University",
    location: "Manila",
    description:
      "A leading engineering and technological university in the Philippines.",
    specialization: "Engineering, Architecture, Information Technology",
    icon: <GraduationCap className="w-12 h-12 text-primary" />,
    color: "bg-orange-50",
    link: "https://www.mapua.edu.ph/",
  },
];

const EducationResources = () => {
  const [activeTab, setActiveTab] = useState("scholarships");

  const renderScholarships = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {scholarships.map((scholarship, index) => (
        <div
          key={index}
          className="isko-card bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 hover:border-primary/20 group"
        >
          <div
            className={`${scholarship.color} p-6 group-hover:bg-opacity-90`}
          >
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-lg p-3 shadow-sm group-hover:shadow">
                {scholarship.icon}
              </div>
              <span className="text-xs font-medium bg-white px-3 py-1 rounded-full text-primary shadow-sm">
                Popular
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2 transition-colors duration-200 group-hover:text-primary">
              {scholarship.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Provided by {scholarship.provider}
            </p>
            <p className="text-gray-600 mb-4">{scholarship.description}</p>
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Eligibility:</h4>
              <p className="text-sm text-gray-600">
                {scholarship.eligibility}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full group-hover:border-primary/50 transition-colors"
            >
              <a
                href={scholarship.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                Learn More <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUniversities = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {universities.map((university, index) => (
        <div
          key={index}
          className="isko-card bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 hover:border-primary/20 group"
        >
          <div
            className={`${university.color} p-6 group-hover:bg-opacity-90`}
          >
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-lg p-3 shadow-sm group-hover:shadow">
                {university.icon}
              </div>
              <span className="text-xs font-medium bg-white px-3 py-1 rounded-full text-primary shadow-sm">
                Top Rated
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2 transition-colors duration-200 group-hover:text-primary">
              {university.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Location: {university.location}
            </p>
            <p className="text-gray-600 mb-4">{university.description}</p>
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Known for:</h4>
              <p className="text-sm text-gray-600">
                {university.specialization}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full group-hover:border-primary/50 transition-colors"
            >
              <a
                href={university.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                Visit Website <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section id="education-resources" className="isko-section">
      <div className="isko-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Education Resources
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore top universities and scholarship opportunities available for Filipino students.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab("scholarships")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === "scholarships"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Scholarships
              </div>
            </button>
            <button
              onClick={() => setActiveTab("universities")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === "universities"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Universities
              </div>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "scholarships" ? renderScholarships() : renderUniversities()}
      </div>
    </section>
  );
};

export default EducationResources;