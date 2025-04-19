// app/lib/rag/universityRAG.ts
import { createClient } from "@supabase/supabase-js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// Define the metadata type for documents
interface DocumentMetadata {
  id?: string;
  name?: string;
  type?: string;
  location?: string;
  website_url?: string;
  [key: string]: any;
}

// Use the same embeddings model as the scholarship RAG
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export class UniversityRAG {
  private vectorStore: MemoryVectorStore | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private supabase = createClient(supabaseUrl, supabaseKey);

  constructor() {
    // Immediately start initializing the RAG system
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log("Initializing University RAG system...");

      // Fetch university data from Supabase
      const documents = await this.loadUniversitiesFromSupabase();
      
      if (documents.length === 0) {
        console.warn("No university data loaded from Supabase");
      } else {
        console.log(`Loaded ${documents.length} university documents from Supabase`);
      }

      // Create vector store with HuggingFace embeddings
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        embeddings
      );

      this.isInitialized = true;
      console.log("University RAG system initialized successfully");
    } catch (error) {
      console.error("Failed to initialize University RAG system:", error);
      throw error;
    }
  }

  private async loadUniversitiesFromSupabase(): Promise<Document<DocumentMetadata>[]> {
    try {
      console.log("Loading university data from Supabase...");
      
      // Fetch all universities from the 'universities' table
      const { data: universities, error } = await this.supabase
        .from('universities')
        .select('*');
      
      if (error) {
        console.error("Error fetching universities from Supabase:", error);
        return [];
      }
      
      if (!universities || universities.length === 0) {
        console.warn("No universities found in Supabase");
        return [];
      }
      
      console.log(`Retrieved ${universities.length} universities from Supabase`);
      
      // Transform each university into a Document
      const documents: Document<DocumentMetadata>[] = universities.map(university => {
        // Compile all the textual content from the university
        const pageContent = this.compileUniversityContent(university);
        
        // Create metadata from university data
        const metadata: DocumentMetadata = {
          id: university.id,
          name: university.name || "Unnamed University",
          type: university.type || "Unknown Type",
          location: university.location || "Unknown Location",
          website_url: university.website_url || "",
          source: "Supabase Database",
          source_type: "database",
          created_at: university.created_at
        };
        
        return new Document({
          pageContent,
          metadata
        });
      });
      
      return documents;
    } catch (error) {
      console.error("Error loading universities from Supabase:", error);
      return [];
    }
  }
  
  private compileUniversityContent(university: any): string {
    // Combine all relevant university information into a single text
    const contentParts = [
      `${university.name}`,
      `Type: ${university.type || ""}`,
      `Location: ${university.location || ""}`,
      `Description: ${university.description || ""}`,
      `Programs: ${Array.isArray(university.programs) ? university.programs.join(", ") : university.programs || ""}`,
      `Admission Requirements: ${university.admission_requirements || ""}`,
      `Tuition Range: ${university.tuition_range || ""}`,
      `Notable Features: ${university.notable_features || ""}`,
      `Website: ${university.website_url || ""}`,
      `Contact Information: ${university.contact_info || ""}`,
      `Ranking: ${university.ranking || ""}`,
      `Accreditation: ${university.accreditation || ""}`
    ];
    
    // Filter out empty parts and join with newlines
    return contentParts
      .filter(part => part.trim() !== "")
      .join("\n\n");
  }

  // Wait for initialization to complete
  async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) {
      await this.initializationPromise;
    } else {
      await this.initialize();
    }
  }

  // Refresh RAG system with latest data from Supabase
  async refresh(): Promise<void> {
    console.log("Refreshing university data from Supabase...");
    this.isInitialized = false;
    await this.initialize();
    console.log("University data refreshed");
  }

  // Query the RAG system with a user question
  async query(
    question: string,
    userProfile?: any
  ): Promise<{
    relevantDocs: string[];
    sources: { id: string; name: string; type: string; location: string; website_url: string }[];
  }> {
    await this.ensureInitialized();

    if (!this.vectorStore) {
      throw new Error("Vector store not initialized");
    }

    try {
      // Enhance the query for more accurate semantic matching
      let enhancedQuery = question;

      // Log the original query for debugging
      console.log("Original university query:", question);

      // Add common synonyms and related terms for better matching
      if (
        question.toLowerCase().includes("university") ||
        question.toLowerCase().includes("college") ||
        question.toLowerCase().includes("school") ||
        question.toLowerCase().includes("campus") ||
        question.toLowerCase().includes("admission") ||
        question.toLowerCase().includes("enrollment")
      ) {
        enhancedQuery = `${question} university college admission enrollment campus programs courses degrees`;
      }

      // Detect specific universities in the query
      const universityKeywords = {
        "up": "University of the Philippines",
        "ateneo": "Ateneo de Manila University",
        "dlsu": "De La Salle University",
        "ust": "University of Santo Tomas",
        "feu": "Far Eastern University",
        "pup": "Polytechnic University of the Philippines",
        "mapua": "Mapua University",
        "admu": "Ateneo de Manila University",
        "silliman": "Silliman University",
        "xavier": "Xavier University"
      };

      for (const [keyword, context] of Object.entries(universityKeywords)) {
        if (question.toLowerCase().includes(keyword)) {
          enhancedQuery = `${enhancedQuery} ${context}`;
        }
      }

      // Add user profile context if available
      if (userProfile) {
        const profileDetails = [];

        if (userProfile.program_interest) {
          profileDetails.push(`program interest: ${userProfile.program_interest}`);
        }

        if (userProfile.course) {
          profileDetails.push(`course/major: ${userProfile.course}`);
        }

        if (userProfile.region) {
          profileDetails.push(`region: ${userProfile.region}`);
        }

        if (profileDetails.length > 0) {
          enhancedQuery = `${enhancedQuery} for student interested in ${profileDetails.join(", ")}`;
        }
      }

      console.log("Enhanced university query:", enhancedQuery);

      // Search for relevant documents
      const results = await this.vectorStore.similaritySearch(enhancedQuery, 5);

      // Log the matching documents for debugging
      console.log(`Found ${results.length} matching universities`);
      
      // Extract relevant content from the results
      const relevantDocs = results.map((doc) => doc.pageContent);

      // Extract source information with proper type handling
      const sources = results.map((doc) => {
        const metadata = doc.metadata as DocumentMetadata;
        return {
          id: metadata.id || "",
          name: metadata.name || "Unnamed University",
          type: metadata.type || "Unknown Type",
          location: metadata.location || "Unknown Location",
          website_url: metadata.website_url || ""
        };
      });

      return {
        relevantDocs,
        sources
      };
    } catch (error) {
      console.error("Error querying University RAG system:", error);
      return {
        relevantDocs: [],
        sources: []
      };
    }
  }
  
  // Method to get a specific university by ID directly from Supabase
  async getUniversityById(id: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('universities')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching university by ID:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getUniversityById:", error);
      return null;
    }
  }
  
  // Method to add a new university or update an existing one
  async upsertUniversity(university: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('universities')
        .upsert(university, { onConflict: 'id' });
        
      if (error) {
        console.error("Error upserting university:", error);
        return false;
      }
      
      // Refresh the RAG system to include the new/updated university
      await this.refresh();
      return true;
    } catch (error) {
      console.error("Error in upsertUniversity:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const universityRAG = new UniversityRAG();