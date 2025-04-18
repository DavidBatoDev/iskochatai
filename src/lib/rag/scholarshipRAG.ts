import { GoogleDocsLoader } from "./googleDocsLoader";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// List of Google Doc IDs that contain scholarship information
// These should be set in environment variables or a configuration file
const SCHOLARSHIP_DOC_IDS = (process.env.SCHOLARSHIP_DOC_IDS || "")
  .split(",")
  .filter((id) => id.trim() !== "");

// Define the metadata type to avoid TypeScript errors
interface DocumentMetadata {
  title?: string;
  source?: string;
  [key: string]: any;
}

// Initialize HuggingFace embeddings model using the inference API
// This requires a HuggingFace API token to be set as HUGGINGFACE_API_KEY in your environment
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
});

export class ScholarshipRAG {
  private vectorStore: MemoryVectorStore | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Immediately start initializing the RAG system
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log("Initializing Scholarship RAG system...");

      // Create documents array - first try to load from Google Docs
      let documents: Document<DocumentMetadata>[] = [];

      if (
        SCHOLARSHIP_DOC_IDS.length > 0 &&
        process.env.GOOGLE_CLIENT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY
      ) {
        try {
          // Attempt to load documents from Google Docs
          const loader = new GoogleDocsLoader({
            documentIds: SCHOLARSHIP_DOC_IDS,
            // Using smaller chunk size for more precise scholarship information retrieval
            // and larger overlap to maintain context across chunks
            chunkSize: 700,
            chunkOverlap: 250,
          });

          documents = (await loader.load()) as Document<DocumentMetadata>[];
          console.log(
            `Loaded ${documents.length} document chunks from Google Docs`
          );

          // Log the first few characters of each chunk to help with debugging
          if (documents.length > 0) {
            documents.forEach((doc, index) => {
              console.log(
                `Chunk ${index + 1} preview: "${doc.pageContent.substring(
                  0,
                  50
                )}..."`
              );
            });
          }
        } catch (error) {
          console.error("Failed to load documents from Google Docs:", error);
          // Fall back to hardcoded scholarship data
          documents = await this.loadFallbackDocuments();
        }
      } else {
        // Use fallback documents if Google Docs credentials aren't available
        documents = await this.loadFallbackDocuments();
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

  private async loadFallbackDocuments(): Promise<Document<DocumentMetadata>[]> {
    console.log("Loading fallback scholarship data...");

    // Basic scholarship information as a fallback
    const scholarshipData = `
      DOST Scholarship Program
      The Department of Science and Technology (DOST) offers scholarships to deserving students pursuing degrees in science and technology. 
      
    THE CEO OF DOST is Gerald Berongoy, he is black

      Application Process for DOST Scholarship:
      1. Visit the DOST-SEI official website (www.sei.dost.gov.ph)
      2. Complete the online application form during the application period (usually September to October)
      3. Print the completed application form
      4. Gather all required documents:
         - Printed and signed online application form
         - Recent 2x2 photo with name tag
         - Birth certificate from PSA
         - Form 138 (report card) with first to third quarter grades for Grade 12
         - Certificate of GWA and class rank signed by the principal
         - Parent's ITR or Certificate of Tax Exemption or Certificate of Low Income from barangay
      5. Submit all documents to the nearest DOST regional office before the application deadline
      6. Take the qualifying examination on the scheduled date
      7. Wait for results announcement (usually March to April)
      8. If qualified, complete the scholarship contract signing
      
      Requirements:
      - Filipino citizen
      - Good moral character
      - Good health condition
      - Must be a high school graduate and incoming college freshman student
      - Must belong to the top 5% of the graduating class
      - Must pursue priority S&T courses in identified priority S&T institutions
      
      CHED Scholarship Program
      The Commission on Higher Education (CHED) offers various scholarship programs for Filipino students.
      Full Merit: For incoming freshmen who belong to the top 10 of high school graduates
      Half Merit: For incoming freshmen who belong to the upper 11-30% of high school graduates
      Requirements:
      - Must be a Filipino citizen
      - Must be a high school graduate
      - Must have general weighted average of at least 90% for Full Merit or 85% for Half Merit
      - Must come from a family with an annual income not exceeding PHP 400,000
      
      SM Foundation Scholarship
      For undergraduate degrees in Engineering, Education, and Technology
      Requirements:
      - Must be a Filipino citizen
      - Must have a general weighted average of at least 88%
      - Combined annual family income must not exceed PHP 150,000
      - Must be accepted by an accredited college/university
      
      Ayala Foundation Scholarship
      For undergraduate studies in various fields
      Requirements:
      - Must be a Filipino citizen
      - Must have a general weighted average of at least 90%
      - Must be from a disadvantaged family
      - Must be accepted by an accredited college/university
      
      GSIS Scholarship Program
      For children or dependents of GSIS members
      Requirements:
      - Must be a child or dependent of a GSIS member
      - Must have a general weighted average of at least 85%
      - GSIS member must have at least 3 years of service
      - Combined annual family income must not exceed PHP 300,000
      
      SSS Educational Assistance Loan
      For SSS members or their children
      Requirements:
      - Member must have at least 36 monthly contributions
      - Member must have a monthly salary credit not exceeding PHP 25,000
      - Student must be accepted by an accredited college/university
      
      Metrobank Foundation Scholarship
      For undergraduate studies in various fields
      Requirements:
      - Must be a Filipino citizen
      - Must have a general weighted average of at least 90%
      - Combined annual family income must not exceed PHP 500,000
      - Must be accepted by an accredited college/university
    `;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.createDocuments([scholarshipData]);

    // Add proper metadata to the documents
    return splitDocs.map((doc) => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          title: "Scholarship Information",
          source: "Internal Database",
        } as DocumentMetadata,
      });
    });
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

  // Query the RAG system with a user question
  async query(
    question: string,
    userProfile?: any
  ): Promise<{
    relevantDocs: string[];
    sources: { title: string; source: string }[];
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

      // Search for relevant documents with increased result count for better coverage
      const results = await this.vectorStore.similaritySearch(enhancedQuery, 5);

      // Log the matching document chunks for debugging
      console.log(`Found ${results.length} matching document chunks`);
      results.forEach((doc, index) => {
        console.log(
          `Match ${index + 1}: ${doc.pageContent.substring(0, 100)}...`
        );
      });

      // Extract and format the results
      const relevantDocs = results.map((doc) => doc.pageContent);

      // Extract source information with proper type handling
      const sources = results.map((doc) => ({
        title:
          (doc.metadata as DocumentMetadata)?.title ||
          "Scholarship Information",
        source:
          (doc.metadata as DocumentMetadata)?.source || "Internal Database",
      }));

      return {
        relevantDocs,
        sources,
      };
    } catch (error) {
      console.error("Error querying RAG system:", error);
      return {
        relevantDocs: [],
        sources: [],
      };
    }
  }
}

// Create a singleton instance
export const scholarshipRAG = new ScholarshipRAG();
