"use client"
import React, { useState, useEffect } from 'react';
import { User, LogOut, Edit3, Save, X, Mail, MapPin, School, Book, ArrowLeft, X as XIcon, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore, supabase } from '@/lib/auth'; 

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

// Define Toast props interface
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

// Toast component
const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto dismiss after 3 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down`}>
      {type === 'success' ? (
        <Check size={18} className="mr-2" />
      ) : (
        <XIcon size={18} className="mr-2" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-3 text-white hover:text-gray-200">
        <XIcon size={16} />
      </button>
    </div>
  );
};

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
  const { user, isAuthenticated, signOut, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    email: "",
    username: "",
    birthday: "",
    gender: "",
    address: "",
    region: "",
    school_name: "",
    course: "",
    grade_level: "",
    program_interest: [],
    family_income: 0,
    academic_gwa: 0,
    scholarship_interest: [],
    other_course: ""
  });

  const [tempProfile, setTempProfile] = useState<UserProfile>({...profile});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({
    program_interest: false,
    scholarship_interest: false
  });

  // Close toast handler
  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Show toast helper function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  // Fetch user profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        router.push('/signin');
        return;
      }
    
      try {
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Error fetching profile:', result.error);
          setError('Failed to load profile data. Please try again.');
          setIsLoading(false);
          return;
        }
        
        if (result.data) {
          setProfile(result.data);
          setTempProfile(result.data);
        } else {
          // No profile found, create a default one
          console.log('No profile found for user:', user.id);
          
          const defaultProfile = {
            id: user.id,
            email: user.email || '',
            username: user.email ? user.email.split('@')[0] : '',
            birthday: '',
            gender: '',
            address: '',
            region: '',
            school_name: '',
            course: '',
            grade_level: '',
            program_interest: [],
            family_income: 0,
            academic_gwa: 0,
            scholarship_interest: []
          };
          
          setProfile(defaultProfile);
          setTempProfile(defaultProfile);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfile();
  }, [isAuthenticated, user, router]);

  // Function to get educational level category
  const getEducationLevel = (gradeLevel: string): 'junior-high' | 'senior-high' | 'college' => {
    if (!gradeLevel) return 'college'; // Default value
    
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
    // Create a sanitized version of the profile where null values for dropdowns are converted to empty strings
    const sanitizedProfile = {
      ...profile,
      gender: profile.gender || '',
      region: profile.region || '',
      grade_level: profile.grade_level || '',
      course: profile.course || '',
      // Ensure arrays are initialized properly
      program_interest: Array.isArray(profile.program_interest) ? profile.program_interest : [],
      scholarship_interest: Array.isArray(profile.scholarship_interest) ? profile.scholarship_interest : []
    };
    
    setTempProfile(sanitizedProfile);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const educationLevel = getEducationLevel(tempProfile.grade_level);
      const updatedProfile = {...tempProfile};
      
      // Handle "Others" strand selection for senior high
      if (educationLevel === 'senior-high' && tempProfile.course === 'Others' && tempProfile.other_course) {
        updatedProfile.course = tempProfile.other_course;
      }
      
      // Ensure arrays are never empty
      if (!updatedProfile.program_interest || updatedProfile.program_interest.length === 0) {
        updatedProfile.program_interest = []; 
      }
      if (!updatedProfile.scholarship_interest || updatedProfile.scholarship_interest.length === 0) {
        updatedProfile.scholarship_interest = [];
      }
  
      if (!updatedProfile.gender) {
        updatedProfile.gender = '';
      } else {
        // For example, if the database expects capitalized values:
        const validGenders = ["Male", "Female", "Non-binary", "Prefer not to say"];
        if (!validGenders.includes(updatedProfile.gender)) {
          updatedProfile.gender = ''; // Or set to a default value
        }
      }
      
      // Remove fields not in the profiles table
      const { other_course, ...profileData } = updatedProfile;
      
      // Update profile via API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      const result = await response.json();

      console.log('result from API:', result.data);
      
      if (!response.ok) {
        console.error('Error updating profile:', result.error);
        setError('Failed to update profile. Please try again.');
        return; // Important: Exit early
      }
      
      // Update local state with the returned data from the API if available
      if (result.data) {
        setProfile(result.data[0]);
      } else {
        // If the API doesn't return the updated profile, use our local version
        setProfile(updatedProfile);
      }
      
      // Show success toast instead of setting successMessage
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      setIsLoading(false)
      
      // Also update auth store profile data if needed
      if (updatedProfile.email !== user.email || updatedProfile.username !== user.username) {
        await updateProfile({
          email: updatedProfile.email,
          username: updatedProfile.username
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
      // Optionally show error toast
      showToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false); // Make sure to always set loading to false
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
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
          value={tempProfile[field as keyof UserProfile] as string || ''}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <option value="">Select gender</option>
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
          value={tempProfile[field as keyof UserProfile] as string || ''}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <option value="">Select region</option>
          {regionOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }
    else if (field === 'grade_level') {
      return (
        <select
          name={field}
          value={tempProfile[field as keyof UserProfile] as string || ''}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <option value="">Select grade level</option>
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
              value={tempProfile[field as keyof UserProfile] as string || ''}
              onChange={handleChange}
              className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 mb-2"
            >
              <option value="">Select strand</option>
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
            value={tempProfile[field as keyof UserProfile] as string || ''}
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
            {!tempProfile[field as keyof UserProfile] || (tempProfile[field as keyof UserProfile] as string[]).length === 0 ? (
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
            {!tempProfile[field as keyof UserProfile] || (tempProfile[field as keyof UserProfile] as string[]).length === 0 ? (
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
          value={tempProfile[field as keyof UserProfile] as string || ''}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      );
    } else if (field === 'family_income' || field === 'academic_gwa') {
      return (
        <input
          type="number"
          name={field}
          value={tempProfile[field as keyof UserProfile] as number || ''}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          step={field === 'academic_gwa' ? "0.01" : "1"}
        />
      );
    } else if (field === 'email' && user?.email) {
      // Display email as read-only if it's from auth
      return (
        <input
          type="text"
          name={field}
          value={tempProfile[field as keyof UserProfile] as string || user.email}
          readOnly
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
      );
    } else {
      return (
        <input
          type="text"
          name={field}
          value={tempProfile[field as keyof UserProfile] as string || ''}
          onChange={handleChange}
          className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          placeholder={`Enter your ${formatLabel(field).toLowerCase()}`}
        />
      );
    }
  };

  // Helper function to display array values in view mode
  const displayArrayValue = (values: string[]) => {
    if (!values || values.length === 0) return "None selected";
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Access Denied</h2>
          <p className="mb-6">You need to be logged in to view your profile.</p>
          <button 
            onClick={() => router.push('/signin')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Loading profile...</h2>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center py-12 px-4">
      {/* Toast notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
      
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
                  {profile.username ? profile.username.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Header with padding for the avatar */}
          <div className="bg-indigo-600 pt-36 pb-6 px-6 text-white flex justify-between items-center">
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold">{profile.username || user?.email?.split('@')[0]}</h2>
              <p className="text-indigo-200 mt-1">{profile.email || user?.email}</p>
              
              {/* Error message area (keeping this for errors only) */}
              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md relative">
                  {error}
                </div>
              )}
              
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
                              <span>{profile[field as keyof UserProfile] || 'Not specified'}</span>
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
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium disabled:bg-green-400"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium disabled:bg-gray-400"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="mt-8 w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IskoProfilePage;