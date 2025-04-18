import { processAllMissingEmbeddings } from '../lib/generateEmbeddings.js';

processAllMissingEmbeddings()
  .then(() => {
    console.log("✅ Finished processing all missing embeddings.");
  })
  .catch(err => {
    console.error("❌ Error:", err);
  });
