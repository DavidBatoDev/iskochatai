/**
 * Test script for Google Docs integration
 *
 * This script tests the connection to Google Docs and retrieves content
 * from the documents specified in your environment variables.
 *
 * Usage:
 * 1. Make sure your environment variables are set up correctly
 * 2. Run with: npx tsx src/scripts/test-google-docs.ts
 */

import { GoogleDocsLoader } from "../lib/rag/googleDocsLoader";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGoogleDocsConnection() {
  console.log("🔍 Testing Google Docs integration...");

  // Check if required environment variables are set
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const docIds = process.env.SCHOLARSHIP_DOC_IDS?.split(",").filter(
    (id) => id.trim() !== ""
  );

  if (!clientEmail) {
    console.error(
      "❌ Error: GOOGLE_CLIENT_EMAIL environment variable is not set"
    );
    return false;
  }

  if (!privateKey) {
    console.error(
      "❌ Error: GOOGLE_PRIVATE_KEY environment variable is not set"
    );
    return false;
  }

  if (!docIds || docIds.length === 0) {
    console.error(
      "❌ Error: SCHOLARSHIP_DOC_IDS environment variable is not set or is empty"
    );
    return false;
  }

  console.log(`📋 Found ${docIds.length} document IDs to test`);
  console.log(`🔑 Using service account: ${clientEmail}`);

  try {
    // Create loader with the configured credentials
    const loader = new GoogleDocsLoader({
      documentIds: docIds,
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Try to load documents
    console.log("📚 Attempting to load documents...");
    const documents = await loader.load();

    // Print results
    console.log(`✅ Successfully loaded ${documents.length} document chunks`);

    // Preview the first chunk from each document
    const uniqueSources = new Set(documents.map((doc) => doc.metadata.source));
    console.log(`📑 Retrieved content from ${uniqueSources.size} documents:`);

    for (const source of uniqueSources) {
      const docsFromSource = documents.filter(
        (doc) => doc.metadata.source === source
      );
      console.log(
        `\n📄 Document: ${docsFromSource[0].metadata.title || source}`
      );
      console.log(`   Total chunks: ${docsFromSource.length}`);
      console.log(
        `   Preview of first chunk: "${docsFromSource[0].pageContent.substring(
          0,
          100
        )}..."`
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Error testing Google Docs connection:", error);
    return false;
  }
}

// Run the test
testGoogleDocsConnection()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Google Docs integration test completed successfully!");
      console.log(
        "Your RAG system should now be able to use content from these documents."
      );
    } else {
      console.log("\n❌ Google Docs integration test failed.");
      console.log(
        "Please check your credentials and document sharing permissions."
      );
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unexpected error during test:", error);
    process.exit(1);
  });
