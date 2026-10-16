const { genAI, EMBEDDING_MODEL } = require('../config/gemini');

/**
 * Generates a single embedding vector for a piece of text using Gemini.
 */
const embedText = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    taskType,
  });
  return result.embedding.values;
};

/**
 * Generates embeddings for an array of text chunks in batches to respect rate limits.
 */
const embedChunks = async (chunks, taskType = 'RETRIEVAL_DOCUMENT', batchSize = 10) => {
  const embeddings = [];
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(batch.map((chunk) => embedText(chunk, taskType)));
    embeddings.push(...batchEmbeddings);
  }
  return embeddings;
};

module.exports = { embedText, embedChunks };
