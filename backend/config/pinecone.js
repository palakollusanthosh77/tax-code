const { Pinecone } = require('@pinecone-database/pinecone');

if (!process.env.PINECONE_API_KEY) {
  console.warn('[Pinecone] PINECONE_API_KEY not set. Vector search will fail until configured.');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'taxcode-insight';

/**
 * Returns a handle to the configured Pinecone index.
 * Assumes the index has already been created (see README / initPinecone.js).
 */
const getPineconeIndex = () => pinecone.index(INDEX_NAME);

/**
 * Idempotently ensures the Pinecone index exists with the correct dimension.
 * Gemini text-embedding-004 produces 768-dimensional vectors.
 */
const ensureIndex = async (dimension = 768) => {
  const existing = await pinecone.listIndexes();
  const found = existing.indexes?.find((idx) => idx.name === INDEX_NAME);
  if (!found) {
    console.log(`[Pinecone] Creating index "${INDEX_NAME}"...`);
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: process.env.PINECONE_CLOUD || 'aws',
          region: process.env.PINECONE_REGION || 'us-east-1',
        },
      },
    });
  }
};

module.exports = { pinecone, getPineconeIndex, ensureIndex, INDEX_NAME };
