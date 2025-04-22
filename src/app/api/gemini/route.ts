// app/api/gemini/route.ts
export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scholarshipRAG } from "@/lib/rag/scholarshipRAG";
import { universityRAG } from "@/lib/rag/universityRAG"; // Import the universityRAG

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GOOGLE_CSE_ID = process.env.GSE_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface UserProfile {
  gender: string | null;
  family_income: any;
  email?: string;
  username?: string;
  school_name?: string;
  course?: string;
  grade_level?: string;
  program_interest?: string;
  academic_gwa?: number;
  scholarship_interest?: string;
  region?: string;
}

// Updated interface for RAG sources to match the new Supabase implementation
interface ScholarshipRagSource {
  id: string;
  title: string;
  provider: string;
  link: string;
}

interface UniversityRagSource {
  id: string;
  name: string;
  type: string;
  location: string;
  website_url: string;
}

interface ScholarshipRagResults {
  relevantDocs: string[];
  sources: ScholarshipRagSource[];
}

interface UniversityRagResults {
  relevantDocs: string[];
  sources: UniversityRagSource[];
}

// Function to perform web search using Google Custom Search
async function performWebSearch(
  query: string,
  userProfile?: UserProfile
): Promise<SearchResult[]> {
  // Determine if this is a university query to enhance the search query properly
  const isUniversityQuery = isUniversityRelatedQuery(query);
  let enhancedQuery = isUniversityQuery 
    ? `${query} philippines university college` 
    : `${query} philippines scholarship`;

  if (userProfile) {
    if (userProfile.region) {
      enhancedQuery += ` ${userProfile.region}`;
    }
    if (userProfile.school_name) {
      enhancedQuery += ` ${userProfile.school_name}`;
    }
    if (userProfile.course || userProfile.program_interest) {
      enhancedQuery += ` ${userProfile.course || userProfile.program_interest}`;
    }
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(
        enhancedQuery
      )}&cr=countryPH&gl=ph`,
      { next: { revalidate: 300 } }
    );

    if (response.status === 429) {
      throw new Error(
        "Quota exceeded for Google Custom Search API. Please try again later."
      );
    }

    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.slice(0, 3).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || "No description available",
    }));
  } catch (error) {
    console.error("Web search error:", error);
    return [];
  }
}

// Function to get user profile from Supabase
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

// Function to get recent conversation history
async function getRecentMessages(
  conversationId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching conversation history:", error);
      return [];
    }

    return (data || []).reverse();
  } catch (error) {
    console.error("Error in getRecentMessages:", error);
    return [];
  }
}

// Function to get user ID from request
async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    const userId = request.headers.get("X-User-ID");

    if (userId) {
      return userId;
    }

    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token && token !== "undefined" && token !== "null") {
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data.user) {
          return data.user.id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error in getUserIdFromRequest:", error);
    return null;
  }
}

// Function to generate a response using a local method if Gemini fails
function generateLocalResponse(
  query: string,
  userProfile?: UserProfile
): string {
  let response =
    "I'm sorry, but I'm currently having trouble connecting to my knowledge services :() ";

  if (isScholarshipQuery(query)) {
    response +=
      "For scholarship inquiries, I recommend checking the following resources:\n\n";
    response += "1. CHED Scholarships: https://ched.gov.ph/scholarships/\n";
    response += "2. DOST Scholarships: https://sei.dost.gov.ph/\n";
    response += "3. Your school's financial aid office\n\n";

    if (userProfile?.school_name) {
      response += `Since you're associated with ${userProfile.school_name}, you might want to check their specific scholarship offerings as well.`;
    } else {
      response +=
        "When our services are back online, I can provide more specific information tailored to your needs.";
    }
  } else if (isUniversityRelatedQuery(query)) {
    response +=
      "For university and college inquiries, I recommend checking the following resources:\n\n";
    response += "1. CHED (Commission on Higher Education): https://ched.gov.ph/\n";
    response += "2. University directories like FindUniversity: https://www.finduniversity.ph/\n";
    response += "3. Specific university websites\n\n";
    
    if (userProfile?.program_interest) {
      response += `Since you're interested in ${userProfile.program_interest}, you might want to research universities that specialize in this field.`;
    } else {
      response +=
        "When our services are back online, I can provide more specific information tailored to your needs.";
    }
  } else {
    response +=
      "Please try asking your question again later when I'm reconnected to my services.";
  }

  return response;
}

// Determine if a query is scholarship related
function isScholarshipQuery(query: string): boolean {
  const scholarshipKeywords = [
    "scholar",
    "scholarship",
    "tuition",
    "financial aid",
    "financial assistance",
    "grant",
    "study grant",
    "educational support",
    "academic funding",
    "stipend",
    "iskolar",
    "iskolarship",
    "requirements",
    "qualifications",
    "deadline",
    "apply",
    "application",
    "college fund",
    "merit",
    "DOST",
    "CHED scholarship",
    "SM foundation",
    "SM scholarship",
    "SM",
    "ayala scholarship",
    "GSIS scholarship",
    "SSS loan",
    "metrobank scholarship",
    "education loan",
    "branch",
    "exam",
    "coverage",
    "test",
    "scope",
    "eligibility",
    "subject",
    "course"
  ];

  return scholarshipKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Determine if a query is university/college related
function isUniversityRelatedQuery(query: string): boolean {
  const universityKeywords = [
    "university",
    "college",
    "school",
    "campus",
    "department",
    "faculty",
    "professor",
    "course",
    "program",
    "major",
    "minor",
    "degree",
    "bachelor",
    "master",
    "doctorate",
    "PhD",
    "admission",
    "enrollment",
    "register",
    "application process",
    "requirements",
    "tuition fee",
    "dormitory",
    "entrance exam",
    "UP diliman",
    "ADMU",
    "DLSU",
    "UST",
    "FEU",
    "PUP",
    "mapua",
    "siliman",
    "ateneo",
    "la salle",
    "pamantasan",
    "kolehiyo",
    "unibersidad",
    "kurso",
    "programa",
    "admission test",
    "UPCAT",
    "ACET",
    "USTET",
    "DCAT",
    "freshmen",
    "transferee",
    "shifting",
    "units",
    "GWA",
    "grades",
    "semester",
    "trimester",
    "quadrimester",
    "dean's list",
    "honors",
    "thesis",
    "dissertation",
    "accreditation",
    "CHED",
    "Commission on Higher Education",
    "exam",
    "scope",
    "coverage",
    "type",
  ];

  return universityKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    const userId = await getUserIdFromRequest(request);
    const isAuthenticated = !!userId;

    const conversationId = requestData.conversationId;

    console.log("User ID:", userId);
    console.log("Conversation ID:", conversationId);
    console.log("Request Data:", requestData);
    console.log("Is Authenticated:", isAuthenticated);

    let userProfile: UserProfile | null = null;
    let conversationHistory: any[] = [];

    if (isAuthenticated && userId) {
      userProfile = await getUserProfile(userId);

      if (conversationId) {
        conversationHistory = await getRecentMessages(conversationId);
      }
    }

    const enableWebSearch = requestData.enableWebSearch === true;

    const userMessages = requestData.messages || [];
    const latestUserMessage =
      userMessages.length > 0
        ? userMessages[userMessages.length - 1].content
        : "";

    const searchKeywords = [
      "search",
      "sumearch",
      "magsearch",
      "mag-search",
      "humanap",
      "hanap",
      "hanapan",
      "scholarship",
      "application",
      "deadline",
      "requirement",
      "program",
      "college",
      "university",
      "admission",
      "kada",
      "kailan",
      "keylan",
      "ano",
      "pano",
      "paano",
      "saan",
      "tuition",
      "financial aid",

      "apply",
      "apply now",
      "eligibility",
      "qualification",
      "qualifications",
      "due date",
      "scholarships",
      "enroll",
      "enrollment",
      "major",
      "course",
      "degree",
      "bachelor",
      "master",
      "PhD",
      "institute",
      "academic",
      "education",
      "study",
      "exam",
      "test",
      "merit",
      "grant",
      "award",
      "fellowship",
      "stipend",
      "scholastic",
      "credentials",
      "certificate",
      "transcript",

      "aplay",
      "aplikasyon",
      "kwalipikasyon",
      "mga kwalipikasyon",
      "takdang panahon",
      "huling araw",
      "iskolar",
      "iskolarship",
      "magparehistro",
      "rekrut",
      "pagtanggap",
      "pagtanggap sa",
      "paaralan",
      "kolehiyo",
      "unibersidad",
      "mag-aral",
      "estudyante",
      "pampaaralan",
      "pang-edukasyon",
      "kurso",
      "diploma",
      "eksamen",
      "pagsusulit",
      "marka",

      "career",
      "careers",
      "job",
      "jobs",
      "employment",
      "profession",
      "professional",
      "occupation",
      "opportunity",
      "opportunities",
      "internship",
      "work",
      "employment opportunities",
      "engineering",
      "technology",
      "IT",
      "information technology",
      "finance",
      "business",
      "marketing",
      "management",
      "science",
      "healthcare",
      "medical",
      "law",
      "architecture",

      "karera",
      "trabaho",
      "oportunidad",
      "pagkakataon",
      "propesyon",
      "pagsasanay",
      "praktis",
      "inhenyeriya",
      "teknolohiya",
      "IT",
      "impormasyon teknolohiya",
      "pinansya",
      "negosyo",
      "merkado",
      "pamamahala",
      "agham",
      "kalusugan",
      "medisina",
      "batas",
      "arkitektura",
      "balak",
    ];

    const shouldSearch =
      enableWebSearch &&
      searchKeywords.some((keyword) =>
        latestUserMessage.toLowerCase().includes(keyword.toLowerCase())
      );

    let searchResults: SearchResult[] = [];
    let usedSearch = false;

    if (shouldSearch) {
      searchResults = await performWebSearch(
        latestUserMessage,
        userProfile || undefined
      );
      console.log("Search results:", searchResults);
      usedSearch = searchResults.length > 0;
    }

    // Check if query is about scholarships or universities
    const isScholarship = isScholarshipQuery(latestUserMessage);
    const isUniversity = isUniversityRelatedQuery(latestUserMessage);
    
    let scholarshipRagResults: ScholarshipRagResults = { relevantDocs: [], sources: [] };
    let universityRagResults: UniversityRagResults = { relevantDocs: [], sources: [] };
    let usedScholarshipRag = false;
    let usedUniversityRag = false;

    // Use ScholarshipRAG for scholarship queries
    if (isScholarship) {
      try {
        console.log("Using RAG for scholarship query");
        scholarshipRagResults = await scholarshipRAG.query(
          latestUserMessage,
          userProfile || undefined
        );
        usedScholarshipRag = scholarshipRagResults.relevantDocs.length > 0;
        console.log(
          "Scholarship RAG results:",
          usedScholarshipRag ? "Found relevant docs" : "No relevant docs found"
        );
      } catch (error) {
        console.error("Error using Scholarship RAG:", error);
      }
    }

    // Use UniversityRAG for university/college queries
    if (isUniversity) {
      try {
        console.log("Using RAG for university query");
        universityRagResults = await universityRAG.query(
          latestUserMessage,
          userProfile || undefined
        );
        usedUniversityRag = universityRagResults.relevantDocs.length > 0;
        console.log(
          "University RAG results:",
          usedUniversityRag ? "Found relevant docs" : "No relevant docs found"
        );
      } catch (error) {
        console.error("Error using University RAG:", error);
      }
    }

    let searchContext = "";
    if (usedSearch && searchResults.length > 0) {
      searchContext = `\n\nI found some relevant information from the web that might help answer this question:\n\n`;
      searchResults.forEach((result, index) => {
        searchContext += `Source ${index + 1}: [${result.title}](${
          result.link
        })\nInformation: ${result.snippet}\n\n`;
      });
      searchContext += `Use this information to provide a more accurate and up-to-date answer.`;
      searchContext += `Remember that sometimes the user ask in taglish or tagalog language, so you should also answer in taglish or tagalog language.`;
    } else {
      searchContext = `\n\nNo relevant information was found from the web. Please provide an answer based on your knowledge.`;
    }

    let scholarshipRagContext = "";
    if (usedScholarshipRag && scholarshipRagResults.relevantDocs.length > 0) {
      scholarshipRagContext = `\n\nI've found specific scholarship information that's relevant to this query:\n\n`;
      scholarshipRagResults.relevantDocs.forEach((doc, index) => {
        scholarshipRagContext += `Information ${index + 1}:\n${doc}\n\n`;
      });
      scholarshipRagContext += `Use this scholarship-specific information to provide a precise and helpful answer.`;
      scholarshipRagContext += `Be sure to mention eligibility requirements and application processes where appropriate.`;
    }

    let universityRagContext = "";
    if (usedUniversityRag && universityRagResults.relevantDocs.length > 0) {
      universityRagContext = `\n\nI've found specific university/college information that's relevant to this query:\n\n`;
      universityRagResults.relevantDocs.forEach((doc, index) => {
        universityRagContext += `Information ${index + 1}:\n${doc}\n\n`;
      });
      universityRagContext += `Use this university-specific information to provide a precise and helpful answer.`;
      universityRagContext += `Be sure to mention admission requirements, programs offered, and application processes where appropriate.`;
    }

    let profileContext = "";
    if (isAuthenticated && userProfile) {
      profileContext = "\n\nUser profile information:";
      if (userProfile.username) {
        profileContext += `\n- Name: ${userProfile.username}`;
      }
      if (userProfile.email) {
        profileContext += `\n- Email: ${userProfile.email}`;
      }
      if (userProfile.school_name) {
        profileContext += `\n- Currently at/interested in: ${userProfile.school_name}`;
      }
      if (userProfile.family_income) {
        profileContext += `\n- Family Income: ${userProfile.family_income}`;
      }
      if (userProfile.gender) {
        profileContext += "\n- Gender: " + userProfile.gender;
      }
      if (userProfile.course) {
        profileContext += `\n- Course/Major: ${userProfile.course}`;
      }
      if (userProfile.grade_level) {
        profileContext += `\n- Grade Level: ${userProfile.grade_level}`;
      }
      if (userProfile.program_interest) {
        profileContext += `\n- Program Interest: ${userProfile.program_interest}`;
      }
      if (userProfile.scholarship_interest) {
        profileContext += `\n- Scholarship Interest: ${userProfile.scholarship_interest}`;
      }
      if (userProfile.region) {
        profileContext += `\n- Region: ${userProfile.region}`;
      }
      if (userProfile.academic_gwa && userProfile.academic_gwa > 0) {
        profileContext += `\n- Academic GWA: ${userProfile.academic_gwa}`;
      }

      profileContext +=
        "\n\nTailor your responses to be more relevant to this user's profile when appropriate.";
    }

    const systemContext = `You are IskoBot, a helpful assistant specializing in scholarship and college/university information for Filipino students. 
    Your goal is to provide accurate, concise, and helpful information about scholarships, universities, admission processes, application deadlines, and required documents.
    Always be encouraging and supportive of students' educational goals. You should answer the questions in a friendly and informative manner. Try to answer the queries as much as possible in taglish language.
    Do not provide any personal opinions or unverified information.
    
    If the user asks about a specific scholarship, provide details about it, including eligibility criteria, application process, and deadlines.
    If the user asks about a specific university or college, provide information about its programs, admission requirements, campus, and notable features.
    If they ask about something that is not related to scholarships or education, politely redirect them to educational topics.
    If they ask how are you implement, don't answer it, just say "I am a chatbot that helps students find scholarships and universities in the Philippines.,"
    Don't mention Google Gemini or any other AI model. Just say "I am a chatbot that helps students find scholarships and universities in the Philippines."
    If they ask about your limitations, say "I am a chatbot that helps students find scholarships and universities in the Philippines. I am not perfect, but I will do my best to help you."
    
    ${searchContext}
    ${scholarshipRagContext}
    ${universityRagContext}
    ${profileContext}
    
    ${
      usedSearch
        ? "IMPORTANT: Begin your response with '[Web Search Used]' and then continue with your answer."
        : ""
    }
    ${
      usedScholarshipRag
        ? "IMPORTANT: Begin your response with '[Scholarship Database Used]' and then continue with your answer."
        : ""
    }
    ${
      usedUniversityRag
        ? "IMPORTANT: Begin your response with '[University Database Used]' and then continue with your answer."
        : ""
    }
    ${
      (usedSearch && usedScholarshipRag) || (usedSearch && usedUniversityRag)
        ? "IMPORTANT: Begin your response with '[Web Search & Database Used]' and then continue with your answer."
        : ""
    }`;

    const conversationHistoryFormatted = [];
    if (isAuthenticated && conversationHistory.length > 0) {
      for (const entry of conversationHistory) {
        if (entry.message && entry.message.trim() !== "") {
          conversationHistoryFormatted.push({
            role: "user",
            parts: [{ text: entry.message }],
          });
        }
        if (entry.response && entry.response.trim() !== "") {
          conversationHistoryFormatted.push({
            role: "model",
            parts: [{ text: entry.response }],
          });
        }
      }
    }

    const currentMessagesFormatted = userMessages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const allMessages = [
      ...conversationHistoryFormatted,
      ...currentMessagesFormatted,
    ];

    const geminiRequestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        ...allMessages,
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    try {
      const geminiResponse = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(geminiRequestBody),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API returned ${geminiResponse.status}`);
      }

      const data = await geminiResponse.json();

      if (data.error) {
        throw new Error(
          data.error.message || "Error communicating with Gemini API"
        );
      }

      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process your request at the moment. Please try again.";

      // Format references based on the source type
      const references = [
        ...(usedSearch
          ? searchResults.map((result) => ({
              title: result.title,
              url: result.link,
              type: "web"
            }))
          : []),
        ...(usedScholarshipRag
          ? scholarshipRagResults.sources.map((source) => ({
              title: source.title || `${source.provider} Scholarship`,
              url: source.link || "#",
              provider: source.provider,
              id: source.id,
              type: "scholarship"
            }))
          : []),
        ...(usedUniversityRag
          ? universityRagResults.sources.map((source) => ({
              title: source.name || "University",
              url: source.website_url || "#",
              location: source.location,
              type: "university",
              university_type: source.type,
              id: source.id
            }))
          : []),
      ];

      return NextResponse.json({
        response: responseText,
        usedSearch: usedSearch,
        usedScholarshipRag: usedScholarshipRag,
        usedUniversityRag: usedUniversityRag,
        references: references,
        isAuthenticated: isAuthenticated,
      });
    } catch (error: any) {
      console.error("Error with Gemini API, using fallback response:", error);
      console.log("Latest user message:", latestUserMessage);

      const fallbackResponse = generateLocalResponse(
        latestUserMessage,
        userProfile || undefined
      );

      return NextResponse.json({
        response: fallbackResponse,
        usedSearch: false,
        usedScholarshipRag: false,
        usedUniversityRag: false,
        references: [],
        isAuthenticated: isAuthenticated,
        error: error.message,
      });
    }
  } catch (error: any) {
    console.error("Error in Gemini API route:", error);

    return NextResponse.json(
      {
        response:
          "I apologize, but I'm experiencing technical difficulties right now. Please try again later.",
        usedSearch: false,
        usedScholarshipRag: false,
        usedUniversityRag: false,
        references: [],
        error: error.message || "Failed to process request",
      },
      { status: 500 }
    );
  }
}