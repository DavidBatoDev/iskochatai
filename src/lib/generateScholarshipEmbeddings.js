// lib/generateEmbeddings.js
import { createClient } from "@supabase/supabase-js";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf"
import dotenv from 'dotenv';;
dotenv.config({ path: '.env.local' });

// Initialize HuggingFace embeddings model
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate embeddings for a scholarship and update the record in Supabase
 * @param {Object} scholarship - The scholarship object with all fields
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export async function generateAndStoreEmbedding(scholarship) {
  try {
    console.log(`Generating embedding for scholarship: ${scholarship.title}`);

    const extraDataFormatted = scholarship.extra_data ? 
    Object.entries(scholarship.extra_data)
      .map(([key, value]) => {
        // Format arrays as comma-separated lists
        const formattedValue = Array.isArray(value) ? value.join(', ') : value;
        // Convert key from snake_case or camelCase to Title Case for better readability
        const formattedKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')
          .replace(/\b\w/g, c => c.toUpperCase());
        return `${formattedKey}: ${formattedValue}`;
      })
      .join('\n') + 
      `\n\nFull Data: ${JSON.stringify(scholarship.extra_data)}` : "";

    console.log("Extra Data Formatted:", extraDataFormatted);

    // Combine relevant fields to create the text for embedding
    const textToEmbed = [
      scholarship.title || "",
      `Provider: ${scholarship.provider || ""}`,
      scholarship.description || "",
      `Eligibility: ${scholarship.eligibility || ""}`,
      `Benefits: ${scholarship.benefits || ""}`,
      scholarship.raw_source_text || "",
      scholarship.summary || "",
      extraDataFormatted,
    ]
      .filter(text => text.trim() !== "")
      .join("\n\n");

    if (!textToEmbed || textToEmbed.trim() === "") {
      console.warn(`No content to embed for scholarship ID: ${scholarship.id}`);
      return false;
    }

    // Generate embedding
    const embeddingVector = await embeddings.embedQuery(textToEmbed);
    
    // Update the scholarship record with the embedding
    const { error } = await supabase
      .from('scholarships')
      .update({ embedding: embeddingVector })
      .eq('id', scholarship.id);

    if (error) {
      console.error(`Failed to update embedding for scholarship ID ${scholarship.id}:`, error);
      return false;
    }

    console.log(`Successfully updated embedding for scholarship ID: ${scholarship.id}`);
    return true;
  } catch (error) {
    console.error(`Error generating/storing embedding for scholarship ID ${scholarship.id}:`, error);
    return false;
  }
}

/**
 * Process all scholarships in the database that don't have embeddings
 * @returns {Promise<void>}
 */
export async function processAllMissingEmbeddings() {
  try {
    // Get scholarships without embeddings or with null embeddings
    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('*')
      .is('embedding', null);

    if (error) {
      console.error("Error fetching scholarships without embeddings:", error);
      return;
    }

    console.log(`Found ${scholarships.length} scholarships without embeddings`);

    // Process each scholarship
    let successCount = 0;
    for (const scholarship of scholarships) {
      const success = await generateAndStoreEmbedding(scholarship);
      if (success) successCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully processed ${successCount} out of ${scholarships.length} scholarships`);
  } catch (error) {
    console.error("Error in processAllMissingEmbeddings:", error);
  }
}

/**
 * Update embeddings for a specific scholarship ID
 * @param {string} scholarshipId - The ID of the scholarship to update
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export async function updateEmbeddingById(scholarshipId) {
  try {
    // Get the scholarship data
    const { data: scholarship, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', scholarshipId)
      .single();

    if (error || !scholarship) {
      console.error(`Scholarship with ID ${scholarshipId} not found:`, error);
      return false;
    }

    return await generateAndStoreEmbedding(scholarship);
  } catch (error) {
    console.error(`Error updating embedding for scholarship ID ${scholarshipId}:`, error);
    return false;
  }
}

/**
 * Update embeddings for all scholarships in the database
 * @returns {Promise<void>}
 */
export async function refreshAllEmbeddings() {
  try {
    // Get all scholarships
    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('*');

    if (error) {
      console.error("Error fetching scholarships:", error);
      return;
    }

    console.log(`Found ${scholarships.length} total scholarships to update embeddings`);

    // Process each scholarship
    let successCount = 0;
    for (const scholarship of scholarships) {
      const success = await generateAndStoreEmbedding(scholarship);
      if (success) successCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully updated embeddings for ${successCount} out of ${scholarships.length} scholarships`);
  } catch (error) {
    console.error("Error in refreshAllEmbeddings:", error);
  }
}

/**
 * Search for scholarships using semantic similarity
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of matching scholarships
 */
export async function semanticSearchScholarships(query, limit = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);
    
    // Search in Supabase using vector similarity
    const { data, error } = await supabase
      .rpc('match_scholarships', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2, // Adjust as needed
        match_count: limit
      });
    
    if (error) {
      console.error("Error searching scholarships:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in semanticSearchScholarships:", error);
    return [];
  }
}

// Export a function to handle batch processing
export async function batchProcessEmbeddings(batchSize = 10) {
  try {
    // Get all scholarships without embeddings
    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('id')
      .is('embedding', null);

    if (error) {
      console.error("Error fetching scholarships without embeddings:", error);
      return;
    }

    const scholarshipIds = scholarships.map(s => s.id);
    console.log(`Found ${scholarshipIds.length} scholarships without embeddings`);

    // Process in batches
    for (let i = 0; i < scholarshipIds.length; i += batchSize) {
      const batchIds = scholarshipIds.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(scholarshipIds.length/batchSize)}`);
      
      // Process batch in parallel with Promise.all
      await Promise.all(
        batchIds.map(async (id) => {
          await updateEmbeddingById(id);
          // Small delay between individual API calls
          await new Promise(resolve => setTimeout(resolve, 200));
        })
      );
      
      // Add delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("Batch processing complete");
  } catch (error) {
    console.error("Error in batchProcessEmbeddings:", error);
  }
}