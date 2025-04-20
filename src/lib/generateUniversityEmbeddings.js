// lib/generateUniversityEmbeddings.js
import { createClient } from "@supabase/supabase-js";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf"
import dotenv from 'dotenv';
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
 * Generate embeddings for a university and update the record in Supabase
 * @param {Object} university - The university object with all fields
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export async function generateAndStoreEmbedding(university) {
  try {
    console.log(`Generating embedding for university: ${university.name}`);

    const extraDataFormatted = university.extra_data ? 
    Object.entries(university.extra_data)
      .map(([key, value]) => {
        // Format arrays as comma-separated lists
        const formattedValue = Array.isArray(value) ? value.join(', ') : value;
        // Convert key from snake_case or camelCase to Title Case for better readability
        const formattedKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')
          .replace(/\b\w/g, c => c.toUpperCase());
        return `${formattedKey}: ${formattedValue}`;
      })
      .join('\n') + 
      `\n\nFull Data: ${JSON.stringify(university.extra_data)}` : "";

    // Combine relevant fields to create the text for embedding
    const textToEmbed = [
      university.name || "",
      `Location: ${university.location || ""}`,
      `Type: ${university.type || ""}`,
      university.description || "",
      university.programs ? `Programs: ${university.programs.join(", ")}` : "",
      `Admission Requirements: ${university.admission_requirements || ""}`,
      `Tuition Range: ${university.tuition_range || ""}`,
      `Notable Features: ${university.notable_features || ""}`,
      `Ranking: ${university.ranking || ""}`,
      `Accreditation: ${university.accreditation || ""}`,
      extraDataFormatted,
    ]
      .filter(text => text.trim() !== "")
      .join("\n\n");

    if (!textToEmbed || textToEmbed.trim() === "") {
      console.warn(`No content to embed for university ID: ${university.id}`);
      return false;
    }

    // Generate embedding
    const embeddingVector = await embeddings.embedQuery(textToEmbed);
    
    // Update the university record with the embedding
    const { error } = await supabase
      .from('universities')
      .update({ embedding: embeddingVector })
      .eq('id', university.id);

    if (error) {
      console.error(`Failed to update embedding for university ID ${university.id}:`, error);
      return false;
    }

    console.log(`Successfully updated embedding for university ID: ${university.id}`);
    return true;
  } catch (error) {
    console.error(`Error generating/storing embedding for university ID ${university.id}:`, error);
    return false;
  }
}

/**
 * Process all universities in the database that don't have embeddings
 * @returns {Promise<void>}
 */
export async function processAllMissingEmbeddings() {
  try {
    // Get universities without embeddings or with null embeddings
    const { data: universities, error } = await supabase
      .from('universities')
      .select('*')
      .is('embedding', null);

    if (error) {
      console.error("Error fetching universities without embeddings:", error);
      return;
    }

    console.log(`Found ${universities.length} universities without embeddings`);

    // Process each university
    let successCount = 0;
    for (const university of universities) {
      const success = await generateAndStoreEmbedding(university);
      if (success) successCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully processed ${successCount} out of ${universities.length} universities`);
  } catch (error) {
    console.error("Error in processAllMissingEmbeddings:", error);
  }
}

/**
 * Update embeddings for a specific university ID
 * @param {string} universityId - The ID of the university to update
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export async function updateEmbeddingById(universityId) {
  try {
    // Get the university data
    const { data: university, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', universityId)
      .single();

    if (error || !university) {
      console.error(`University with ID ${universityId} not found:`, error);
      return false;
    }

    return await generateAndStoreEmbedding(university);
  } catch (error) {
    console.error(`Error updating embedding for university ID ${universityId}:`, error);
    return false;
  }
}

/**
 * Update embeddings for all universities in the database
 * @returns {Promise<void>}
 */
export async function refreshAllEmbeddings() {
  try {
    // Get all universities
    const { data: universities, error } = await supabase
      .from('universities')
      .select('*');

    if (error) {
      console.error("Error fetching universities:", error);
      return;
    }

    console.log(`Found ${universities.length} total universities to update embeddings`);

    // Process each university
    let successCount = 0;
    for (const university of universities) {
      const success = await generateAndStoreEmbedding(university);
      if (success) successCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully updated embeddings for ${successCount} out of ${universities.length} universities`);
  } catch (error) {
    console.error("Error in refreshAllEmbeddings:", error);
  }
}

/**
 * Search for universities using semantic similarity
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of matching universities
 */
export async function semanticSearchUniversities(query, limit = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);
    
    // Search in Supabase using vector similarity
    const { data, error } = await supabase
      .rpc('match_universities', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2, // Adjust as needed
        match_count: limit
      });
    
    if (error) {
      console.error("Error searching universities:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in semanticSearchUniversities:", error);
    return [];
  }
}

/**
 * Handle batch processing for university embeddings
 * @param {number} batchSize - Number of universities to process in each batch
 * @returns {Promise<void>}
 */
export async function batchProcessEmbeddings(batchSize = 10) {
  try {
    // Get all universities without embeddings
    const { data: universities, error } = await supabase
      .from('universities')
      .select('id')
      .is('embedding', null);

    if (error) {
      console.error("Error fetching universities without embeddings:", error);
      return;
    }

    const universityIds = universities.map(u => u.id);
    console.log(`Found ${universityIds.length} universities without embeddings`);

    // Process in batches
    for (let i = 0; i < universityIds.length; i += batchSize) {
      const batchIds = universityIds.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(universityIds.length/batchSize)}`);
      
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