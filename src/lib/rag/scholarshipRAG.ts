// app/lib/rag/scholarshipRAG.ts
import { createClient } from "@supabase/supabase-js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// Define the metadata type for documents
interface DocumentMetadata {
  title?: string;
  source?: string;
  provider?: string;
  link?: string;
  id?: string;
  [key: string]: any;
}

// Initialize HuggingFace embeddings model using the inference API
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
});

// Initialize Supabase client - corrected version
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export class ScholarshipRAG {
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

      console.log("Initializing Scholarship RAG system...");

      // Fetch scholarship data from Supabase
      const documents = await this.loadScholarshipsFromSupabase();
      
      if (documents.length === 0) {
        console.warn("No scholarship data loaded from Supabase");
        // You might want to fall back to a default dataset here
      } else {
        console.log(`Loaded ${documents.length} scholarship documents from Supabase`);
      }

      // Create vector store with HuggingFace embeddings
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        embeddings
      );

      this.isInitialized = true;
      console.log("Scholarship RAG system initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Scholarship RAG system:", error);
      throw error;
    }
  }

  private async loadScholarshipsFromSupabase(): Promise<Document<DocumentMetadata>[]> {
    try {
      console.log("Loading scholarship data from Supabase...");
      
      // Fetch all scholarships from the 'scholarships' table
      const { data: scholarships, error } = await this.supabase
        .from('scholarships')
        .select('*');
      
      if (error) {
        console.error("Error fetching scholarships from Supabase:", error);
        return [];
      }
      
      if (!scholarships || scholarships.length === 0) {
        console.warn("No scholarships found in Supabase");
        return [];
      }
      
      console.log(`Retrieved ${scholarships.length} scholarships from Supabase`);
      
      // Transform each scholarship into a Document
      const documents: Document<DocumentMetadata>[] = scholarships.map(scholarship => {
        // Compile all the textual content from the scholarship
        const pageContent = this.compileScholarshipContent(scholarship);
        
        // Create metadata from scholarship data
        const metadata: DocumentMetadata = {
          id: scholarship.id,
          title: scholarship.title || "Untitled Scholarship",
          provider: scholarship.provider || "Unknown Provider",
          link: scholarship.link || "",
          source: "Supabase Database",
          source_type: scholarship.source_type || "database",
          created_at: scholarship.created_at
        };
        
        return new Document({
          pageContent,
          metadata
        });
      });
      
      return documents;
    } catch (error) {
      console.error("Error loading scholarships from Supabase:", error);
      return [];
    }
  }
  
  private compileScholarshipContent(scholarship: any): string {
    // Combine all relevant scholarship information into a single text
    const contentParts = [
      `${scholarship.title}`,
      `Provider: ${scholarship.provider}`,
      `${scholarship.description || ""}`,
      `Eligibility: ${scholarship.eligibility || ""}`,
      `Benefits: ${scholarship.benefits || ""}`,
      `Deadline: ${scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "Ongoing"}`,
      `${scholarship.raw_source_text || ""}`,
      `${scholarship.summary || ""}`
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
    console.log("Refreshing scholarship data from Supabase...");
    this.isInitialized = false;
    await this.initialize();
    console.log("Scholarship data refreshed");
  }

  // Query the RAG system with a user question
  async query(
    question: string,
    userProfile?: any
  ): Promise<{
    relevantDocs: string[];
    sources: { id: string; title: string; provider: string; link: string }[];
  }> {
    await this.ensureInitialized();

    if (!this.vectorStore) {
      throw new Error("Vector store not initialized");
    }

    try {
      // Enhance the query for more accurate semantic matching
      let enhancedQuery = question;

      // Log the original query for debugging
      console.log("Original query:", question);

      // Add common synonyms and related terms for better matching
      if (
        question.toLowerCase().includes("application") ||
        question.toLowerCase().includes("apply") ||
        question.toLowerCase().includes("process") ||
        question.toLowerCase().includes("how to")
      ) {
        enhancedQuery = `${question} application process steps requirements how to apply`;
      }

      // Detect scholarship names in the query
      const scholarshipKeywords = {
        dost: "DOST Science Education Institute Scholarship",
        ched: "CHED Scholarship Commission on Higher Education",
        sm: "SM Foundation Scholarship",
        ayala: "Ayala Foundation Scholarship",
        gsis: "GSIS Scholarship Government Service Insurance System",
        sss: "SSS Educational Assistance Loan Social Security System",
        metrobank: "Metrobank Foundation Scholarship",
      };

      for (const [keyword, context] of Object.entries(scholarshipKeywords)) {
        if (question.toLowerCase().includes(keyword)) {
          enhancedQuery = `${enhancedQuery} ${context}`;
        }
      }

      // Add user profile context if available
      if (userProfile) {
        const profileDetails = [];

        if (userProfile.grade_level) {
          profileDetails.push(`education level: ${userProfile.grade_level}`);
        }

        if (userProfile.course) {
          profileDetails.push(`course/major: ${userProfile.course}`);
        }

        if (userProfile.family_income) {
          profileDetails.push(`family income: ${userProfile.family_income}`);
        }

        if (userProfile.academic_gwa) {
          profileDetails.push(`academic GWA: ${userProfile.academic_gwa}`);
        }

        if (profileDetails.length > 0) {
          enhancedQuery = `${enhancedQuery} for student with ${profileDetails.join(
            ", "
          )}`;
        }
      }

      console.log("Enhanced query:", enhancedQuery);

      // Search for relevant documents
      const results = await this.vectorStore.similaritySearch(enhancedQuery, 5);

      // Log the matching documents for debugging
      console.log(`Found ${results.length} matching scholarships`);
      
      // Extract relevant content from the results
      const relevantDocs = results.map((doc) => doc.pageContent);

      // Extract source information with proper type handling
      const sources = results.map((doc) => {
        const metadata = doc.metadata as DocumentMetadata;
        return {
          id: metadata.id || "",
          title: metadata.title || "Untitled Scholarship",
          provider: metadata.provider || "Unknown Provider",
          link: metadata.link || ""
        };
      });

      return {
        relevantDocs,
        sources
      };
    } catch (error) {
      console.error("Error querying RAG system:", error);
      return {
        relevantDocs: [],
        sources: []
      };
    }
  }
  
  // Method to get a specific scholarship by ID directly from Supabase
  async getScholarshipById(id: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching scholarship by ID:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getScholarshipById:", error);
      return null;
    }
  }
  
  // Method to add a new scholarship or update an existing one
  async upsertScholarship(scholarship: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('scholarships')
        .upsert(scholarship, { onConflict: 'id' });
        
      if (error) {
        console.error("Error upserting scholarship:", error);
        return false;
      }
      
      // Refresh the RAG system to include the new/updated scholarship
      await this.refresh();
      return true;
    } catch (error) {
      console.error("Error in upsertScholarship:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const scholarshipRAG = new ScholarshipRAG();