// app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scholarshipRAG } from "@/lib/rag/scholarshipRAG";

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

// Define interfaces for RAG results to fix TypeScript errors
interface RagSource {
  title: string;
  source: string;
}

interface RagResults {
  relevantDocs: string[];
  sources: RagSource[];
}

// Function to perform web search using Google Custom Search
async function performWebSearch(
  query: string,
  userProfile?: UserProfile
): Promise<SearchResult[]> {
  let enhancedQuery = `${query} philippines scholarship`;

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
    "I'm sorry, but I'm currently having trouble connecting to my knowledge services. ";

  const scholarshipKeywords = [
    "scholarship",
    "tuition",
    "financial aid",
    "iskolarship",
    "study",
    "school",
  ];
  const hasScholarshipKeyword = scholarshipKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasScholarshipKeyword) {
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
    "CHED",
    "education commission",
    "SM foundation",
    "ayala",
    "GSIS",
    "SSS loan",
    "metrobank",
    "education loan",
  ];

  return scholarshipKeywords.some((keyword) =>
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

    const isScholarship = isScholarshipQuery(latestUserMessage);
    let ragResults: RagResults = { relevantDocs: [], sources: [] };
    let usedRag = false;

    if (isScholarship) {
      try {
        console.log("Using RAG for scholarship query");
        ragResults = await scholarshipRAG.query(
          latestUserMessage,
          userProfile || undefined
        );
        usedRag = ragResults.relevantDocs.length > 0;
        console.log(
          "RAG results:",
          usedRag ? "Found relevant docs" : "No relevant docs found"
        );
      } catch (error) {
        console.error("Error using RAG:", error);
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

    let ragContext = "";
    if (usedRag && ragResults.relevantDocs.length > 0) {
      ragContext = `\n\nI've found specific scholarship information that's relevant to this query:\n\n`;
      ragResults.relevantDocs.forEach((doc, index) => {
        ragContext += `Information ${index + 1}:\n${doc}\n\n`;
      });
      ragContext += `Use this scholarship-specific information to provide a precise and helpful answer.`;
      ragContext += `Be sure to mention eligibility requirements and application processes where appropriate.`;
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

    const systemContext = `You are IskoBot, a helpful assistant specializing in scholarship and college application information for students. 
    Your goal is to provide accurate, concise, and helpful information about scholarships, application processes, deadlines, and required documents.
    Always be encouraging and supportive of students' educational goals. You should answer the questions in a friendly and informative manner. Try to answer the queries as much as possible in taglish language.
    Do not provide any personal opinions or unverified information.
    If the user asks about a specific scholarship, provide details about it, including eligibility criteria, application process, and deadlines.
    If they ask about something that is not related to scholarships, politely redirect them to the topic of scholarships.
    ${searchContext}
    ${ragContext}
    ${profileContext}
    
    ${
      usedSearch
        ? "IMPORTANT: Begin your response with '[Web Search Used]' and then continue with your answer."
        : ""
    }
    ${
      usedRag
        ? "IMPORTANT: Begin your response with '[Scholarship Database Used]' and then continue with your answer."
        : ""
    }
    ${
      usedSearch && usedRag
        ? "IMPORTANT: Begin your response with '[Web Search & Scholarship Database Used]' and then continue with your answer."
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
          signal: AbortSignal.timeout(10000),
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

      const references = [
        ...(usedSearch
          ? searchResults.map((result) => ({
              title: result.title,
              url: result.link,
            }))
          : []),
        ...(usedRag
          ? ragResults.sources.map((source) => ({
              title: source.title,
              url: source.source,
            }))
          : []),
      ];

      return NextResponse.json({
        response: responseText,
        usedSearch: usedSearch,
        usedRag: usedRag,
        references: references,
        isAuthenticated: isAuthenticated,
      });
    } catch (error: any) {
      console.error("Error with Gemini API, using fallback response:", error);

      const fallbackResponse = generateLocalResponse(
        latestUserMessage,
        userProfile || undefined
      );

      return NextResponse.json({
        response: fallbackResponse,
        usedSearch: false,
        usedRag: false,
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
        usedRag: false,
        references: [],
        error: error.message || "Failed to process request",
      },
      { status: 500 }
    );
  }
}
