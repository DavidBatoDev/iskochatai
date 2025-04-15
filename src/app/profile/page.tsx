"use client"
import React, { useState, useEffect } from 'react';
import { User, LogOut, Edit3, Save, X, Mail, MapPin, School, Book, Calculator, CreditCard, Calendar, ArrowLeft, X as XIcon, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  birthday: string;
  gender: string;
  address: string;
  region: string;
  school_name: string;
  course: string;
  grade_level: string;
  program_interest: string[];
  family_income: number;
  academic_gwa: number;
  scholarship_interest: string[];
  created_at?: string;
  other_course?: string;
}

// Define input groups for better organization
interface InputGroup {
  title: string;
  icon: React.ReactNode;
  fields: string[];
}

// Define options for dropdown menus
const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

const regionOptions = [
  "Metro Manila", "Ilocos Region", "Cagayan Valley", "Central Luzon",
  "CALABARZON", "MIMAROPA", "Bicol Region", "Western Visayas", 
  "Central Visayas", "Eastern Visayas", "Zamboanga Peninsula", 
  "Northern Mindanao", "Davao Region", "SOCCSKSARGEN", 
  "Caraga", "BARMM", "CAR", "NCR"
];

const scholarshipInterestOptions = [
  "Academic Merit-based", "Financial Need-based", "Sports", "Arts and Culture",
  "Research", "Community Service", "Industry-specific", "International Exchange",
  "Government", "Private Institutions", "Mixed"
];

const programInterestOptions = [
  "Software Development", "Data Science", "Artificial Intelligence", "Cybersecurity",
  "Web Development", "Mobile App Development", "Cloud Computing", "DevOps",
  "Database Administration", "Network Engineering", "UI/UX Design", "Game Development",
  "Blockchain", "IoT", "Robotics", "Bioinformatics"
];

const gradeLevelOptions = [
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", 
  "Grade 11", "Grade 12", 
  "1st Year College", "2nd Year College", "3rd Year College", "4th Year College"
];

const shsStrandOptions = [
  "STEM (Science, Technology, Engineering, and Mathematics)",
  "ABM (Accountancy, Business, and Management)",
  "HUMSS (Humanities and Social Sciences)",
  "GAS (General Academic Strand)",
  "TVL (Technical-Vocational-Livelihood)",
  "Arts and Design",
  "Sports",
  "Others"
];

const IskoProfilePage: React.FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: "12345-abcde",
    email: "student@example.edu",
    username: "student123",
    birthday: "2000-05-15",
    gender: "Prefer not to say",
    address: "123 Campus Drive",
    region: "Metro Manila",
    school_name: "National University",
    course: "Computer Science",
    grade_level: "3rd Year College",
    program_interest: ["Software Development", "Web Development"],
    family_income: 350000,
    academic_gwa: 1.75,
    scholarship_interest: ["Merit-based Scholarship", "Research"],
    other_course: ""
  });

  const [tempProfile, setTempProfile] = useState<UserProfile>({...profile});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({
    program_interest: false,
    scholarship_interest: false
  });

  // Function to get educational level category
  const getEducationLevel = (gradeLevel: string): 'junior-high' | 'senior-high' | 'college' => {
    if (gradeLevel.includes("Grade") && parseInt(gradeLevel.split(" ")[1]) <= 10) {
      return 'junior-high';
    } else if (gradeLevel.includes("Grade") && parseInt(gradeLevel.split(" ")[1]) >= 11) {
      return 'senior-high';
    } else {
      return 'college';
    }
  };

  // Update course field when grade level changes
  useEffect(() => {
    if (!isEditing) return;
    
    const educationLevel = getEducationLevel(tempProfile.grade_level);
    if (educationLevel === 'junior-high') {
      setTempProfile(prev => ({
        ...prev,
        course: "Junior High School"
      }));
    }
  }, [tempProfile.grade_level, isEditing]);

  // Define input groups
  const inputGroups: InputGroup[] = [
    {
      title: "Personal Information",
      icon: <User size={20} />,
      fields: ["username", "email", "birthday", "gender"]
    },
    {
      title: "Location",
      icon: <MapPin size={20} />,
      fields: ["address", "region"]
    },
    {
      title: "Education",
      icon: <School size={20} />,
      fields: getEducationLevel(profile.grade_level) !== 'junior-high' 
        ? ["school_name", "grade_level", "course"] 
        : ["school_name", "grade_level"]
    },
    {
      title: "Scholarship Information",
      icon: <Book size={20} />,
      fields: ["program_interest", "scholarship_interest", "family_income", "academic_gwa"]
    }
  ];

  const handleEdit = (): void => {
    setTempProfile({...profile});
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
  };

  const handleSave = (): void => {
    const educationLevel = getEducationLevel(tempProfile.grade_level);
    let updatedProfile = {...tempProfile};
    
    // Handle "Others" strand selection for senior high
    if (educationLevel === 'senior-high' && tempProfile.course === 'Others' && tempProfile.other_course) {
      updatedProfile.course = tempProfile.other_course;
    }
    
    setProfile(updatedProfile);
    setIsEditing(false);
    // Here you would typically send the updated profile to your backend
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    // Special handling for grade level to reset course when needed
    if (name === 'grade_level') {
      const educationLevel = getEducationLevel(value);
      if (educationLevel === 'junior-high') {
        setTempProfile(prev => ({
          ...prev,
          [name]: value,
          course: "Junior High School"
        }));
        return;
      }
    }
    
    setTempProfile(prev => ({
      ...prev,
      [name]: name === 'family_income' || name === 'academic_gwa' 
        ? parseFloat(value) 
        : value
    }));
  };

  const toggleDropdown = (field: string): void => {
    setDropdownOpen(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleMultiSelectItem = (field: string, value: string): void => {
    setTempProfile(prev => {
      const currentValues = [...prev[field as keyof UserProfile] as string[]];
      const index = currentValues.indexOf(value);
      
      if (index === -1) {
        // Add the value if it doesn't exist
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      } else {
        // Remove the value if it exists
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      }
    });
  };

  const formatLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to render the appropriate input element based on field type
  const renderInputField = (field: string) => {
    if (field === 'gender') {
      return (
        <select
          name={field}
          value={tempProfile[field as keyof UserProfile] as string}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          {genderOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else if (field === 'region') {
      return (
        <select
          name={field}
          value={tempProfile[field as keyof UserProfile] as string}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          {regionOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else if (field === 'grade_level') {
      return (
        <select
          name={field}
          value={tempProfile[field as keyof UserProfile] as string}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          {gradeLevelOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else if (field === 'course') {
      const educationLevel = getEducationLevel(tempProfile.grade_level);
      
      if (educationLevel === 'junior-high') {
        return null; // Don't show course field for junior high
      } else if (educationLevel === 'senior-high') {
        return (
          <div>
            <select
              name={field}
              value={tempProfile[field as keyof UserProfile] as string}
              onChange={handleChange}
              className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 mb-2"
            >
              {shsStrandOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            {tempProfile.course === 'Others' && (
              <input
                type="text"
                name="other_course"
                placeholder="Please specify strand"
                value={tempProfile.other_course || ''}
                onChange={handleChange}
                className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 mt-2"
              />
            )}
          </div>
        );
      } else {
        // College level - free text input
        return (
          <input
            type="text"
            name={field}
            value={tempProfile[field as keyof UserProfile] as string}
            onChange={handleChange}
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            placeholder="Enter your course or program"
          />
        );
      }
    } else if (field === 'scholarship_interest') {
      return (
        <div className="relative">
          <div 
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex flex-wrap gap-1 cursor-pointer"
            onClick={() => toggleDropdown(field)}
          >
            {tempProfile[field as keyof UserProfile].length === 0 ? (
              <span className="text-gray-400">Select interests</span>
            ) : (
              (tempProfile[field as keyof UserProfile] as string[]).map(item => (
                <div key={item} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm flex items-center">
                  {item}
                  <button 
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMultiSelectItem(field, item);
                    }}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {dropdownOpen[field] && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-indigo-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {scholarshipInterestOptions.map(option => (
                <div 
                  key={option}
                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleMultiSelectItem(field, option)}
                >
                  <span>{option}</span>
                  {(tempProfile[field as keyof UserProfile] as string[]).includes(option) && (
                    <Check size={16} className="text-indigo-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (field === 'program_interest') {
      return (
        <div className="relative">
          <div 
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex flex-wrap gap-1 cursor-pointer"
            onClick={() => toggleDropdown(field)}
          >
            {tempProfile[field as keyof UserProfile].length === 0 ? (
              <span className="text-gray-400">Select interests</span>
            ) : (
              (tempProfile[field as keyof UserProfile] as string[]).map(item => (
                <div key={item} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm flex items-center">
                  {item}
                  <button 
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMultiSelectItem(field, item);
                    }}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {dropdownOpen[field] && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-indigo-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {programInterestOptions.map(option => (
                <div 
                  key={option}
                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleMultiSelectItem(field, option)}
                >
                  <span>{option}</span>
                  {(tempProfile[field as keyof UserProfile] as string[]).includes(option) && (
                    <Check size={16} className="text-indigo-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (field === 'birthday') {
      return (
        <input
          type="date"
          name={field}
          value={tempProfile[field as keyof UserProfile] as string}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      );
    } else if (field === 'family_income' || field === 'academic_gwa') {
      return (
        <input
          type="number"
          name={field}
          value={tempProfile[field as keyof UserProfile] as number}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          step={field === 'academic_gwa' ? "0.01" : "1"}
        />
      );
    } else {
      return (
        <input
          type="text"
          name={field}
          value={tempProfile[field as keyof UserProfile] as string}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      );
    }
  };

  // Helper function to display array values in view mode
  const displayArrayValue = (values: string[]) => {
    if (values.length === 0) return "None selected";
    return (
      <div className="flex flex-wrap gap-1">
        {values.map(value => (
          <span key={value} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm">
            {value}
          </span>
        ))}
      </div>
    );
  };

  // Determine if the current field should be shown based on the education level
  const shouldShowField = (field: string) => {
    if (field === 'course') {
      return getEducationLevel(profile.grade_level) !== 'junior-high';
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center py-12 px-4">
      {/* Grid background overlay */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <React.Fragment key={`row-${i}`}>
            {Array.from({ length: 12 }).map((_, j) => (
              <div key={`cell-${i}-${j}`} className="border border-blue-300"></div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl overflow-hidden">
          {/* back button */}
          <button
            onClick={() => router.back()}
            className="z-10 absolute top-4 left-4 flex items-center cursor-pointer text-white py-2 px-4 rounded-lg shadow-md"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
          
          {/* Profile Avatar - Centered at the top */}
          <div className="relative flex justify-center">
            <div className="absolute top-1 rounded-full h-32 w-32 bg-gradient-to-br from-indigo-500 to-blue-600 p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <div className="text-4xl font-bold text-indigo-600">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Header with padding for the avatar */}
          <div className="bg-indigo-600 pt-36 pb-6 px-6 text-white flex justify-between items-center">
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              <p className="text-indigo-200 mt-1">{profile.email}</p>
              {/* description */}
              <p className='text-indigo-300 mt-4'>
                Update your profile details regularly to improve your scholarship matching results. Complete information helps us find the best opportunities for you!
              </p>
            </div>
            {!isEditing && (
              <button 
                onClick={handleEdit}
                className="absolute top-4 right-4 flex items-center bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <Edit3 size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
          
          <div className="p-6">
            {inputGroups.map((group, index) => (
              <div key={index} className="mb-8">
                <div className="flex items-center mb-4 border-b border-indigo-100 pb-2">
                  <div className="mr-2 text-indigo-600">{group.icon}</div>
                  <h3 className="text-lg font-semibold text-indigo-700">{group.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.fields.map((field) => (
                    shouldShowField(field) && (
                      <div key={field} className="relative mb-2">
                        <label className="block text-sm font-medium text-indigo-600 mb-1">
                          {formatLabel(field)}
                        </label>
                        
                        {isEditing ? (
                          renderInputField(field)
                        ) : (
                          <div className="bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors duration-200">
                            {field === 'program_interest' || field === 'scholarship_interest' ? 
                              displayArrayValue(profile[field as keyof UserProfile] as string[]) : 
                              <span>{profile[field as keyof UserProfile]}</span>
                            }
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
            
            {isEditing ? (
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
                >
                  <Save size={18} className="mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="mt-8 w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-blue-100 text-sm">
          <p>© 2025 IskoChatAI - Your Smart Companion for Scholarships in the Philippines</p>
        </div>
      </div>
    </div>
  );
};

export default IskoProfilePage;