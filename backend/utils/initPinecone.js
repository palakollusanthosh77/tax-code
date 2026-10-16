/**
 * One-time setup script: creates the Pinecone index if it doesn't exist.
 * Run with: node utils/initPinecone.js
 */
require('dotenv').config();
const { ensureIndex } = require('../config/pinecone');

(async () => {
  try {
    await ensureIndex(768); // Gemini text-embedding-004 dimension
    console.log('Pinecone index is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize Pinecone index:', err.message);
    process.exit(1);
  }
})();
