import { google } from "googleapis";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Configure Google Auth
const SCOPES = ["https://www.googleapis.com/auth/documents.readonly"];

interface GoogleDocsLoaderOptions {
  googleClientEmail?: string;
  googlePrivateKey?: string;
  documentIds: string[];
  chunkSize?: number;
  chunkOverlap?: number;
}

export class GoogleDocsLoader {
  private googleClientEmail: string;
  private googlePrivateKey: string;
  private documentIds: string[];
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(options: GoogleDocsLoaderOptions) {
    this.googleClientEmail =
      options.googleClientEmail || process.env.GOOGLE_CLIENT_EMAIL || "";
    this.googlePrivateKey =
      options.googlePrivateKey ||
      (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

    // Clean document IDs to ensure they're in the correct format
    this.documentIds = options.documentIds.map((id) =>
      this.cleanDocumentId(id)
    );

    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 200;

    if (!this.googleClientEmail || !this.googlePrivateKey) {
      throw new Error("Missing Google API credentials");
    }

    if (!this.documentIds.length) {
      throw new Error("At least one Google Doc ID is required");
    }
  }

  // Extract the clean document ID from a full URL or ID string
  private cleanDocumentId(docId: string): string {
    // Check if it's a full URL
    if (docId.includes("docs.google.com/document/d/")) {
      // Extract the ID portion from the URL
      const match = docId.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If there's /edit or other parts after the ID, remove them
    if (docId.includes("/")) {
      return docId.split("/")[0];
    }

    // Otherwise just return the ID as is
    return docId;
  }

  private async authorize() {
    const auth = new google.auth.JWT({
      email: this.googleClientEmail,
      key: this.googlePrivateKey,
      scopes: SCOPES,
    });

    return auth;
  }

  private extractTextFromDoc(doc: any): string {
    let text = "";
    const content = doc.body.content;

    // Function to extract text from elements
    const extractText = (element: any) => {
      if (element.paragraph) {
        const paragraph = element.paragraph;
        if (paragraph.elements) {
          paragraph.elements.forEach((elem: any) => {
            if (elem.textRun && elem.textRun.content) {
              text += elem.textRun.content;
            }
          });
        }
      } else if (element.table) {
        const table = element.table;
        if (table.tableRows) {
          table.tableRows.forEach((row: any) => {
            if (row.tableCells) {
              row.tableCells.forEach((cell: any) => {
                if (cell.content) {
                  cell.content.forEach((cellContent: any) => {
                    extractText(cellContent);
                  });
                }
              });
            }
          });
        }
      }
    };

    // Process each content element
    if (content) {
      content.forEach((element: any) => {
        extractText(element);
      });
    }

    return text;
  }

  async load(): Promise<Document[]> {
    try {
      // Authorize with Google
      const auth = await this.authorize();
      const docs = google.docs({ version: "v1", auth });

      // Create an array to hold all the documents
      const documents: Document[] = [];

      // Get each document
      for (const docId of this.documentIds) {
        try {
          console.log(`Fetching document: ${docId}`);
          const response = await docs.documents.get({ documentId: docId });

          // Extract the document text
          const docText = this.extractTextFromDoc(response.data);

          // Create metadata
          const metadata = {
            source: `gdoc-${docId}`,
            title: response.data.title || `Document ${docId}`,
          };

          // Split the text into chunks
          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
          });

          const docChunks = await textSplitter.splitText(docText);

          // Create Document objects for each chunk
          const chunkDocuments = docChunks.map(
            (chunk) => new Document({ pageContent: chunk, metadata })
          );

          documents.push(...chunkDocuments);
        } catch (error: any) {
          console.error(`Error loading document ${docId}:`, error.message);
          // Continue with other documents
        }
      }

      if (documents.length === 0) {
        throw new Error("Could not load any documents from Google Docs");
      }

      return documents;
    } catch (error) {
      console.error("Error loading Google Docs:", error);
      throw new Error(
        `Failed to load Google Docs: ${(error as Error).message}`
      );
    }
  }
}
