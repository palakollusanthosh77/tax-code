const { v4: uuidv4 } = require('uuid');
const { getPineconeIndex } = require('../config/pinecone');

/**
 * Upserts a batch of chunk embeddings into Pinecone with rich metadata
 * so retrieved results can be traced back to their source document.
 */
const upsertChunks = async ({ documentId, documentTitle, chunks, embeddings, category }) => {
  const index = getPineconeIndex();

  const vectors = chunks.map((chunk, i) => ({
    id: `${documentId}-${uuidv4()}`,
    values: embeddings[i],
    metadata: {
      documentId: String(documentId),
      documentTitle,
      category: category || 'Other',
      chunkIndex: i,
      text: chunk.slice(0, 4000), // Pinecone metadata size limits
    },
  }));

  // Pinecone recommends batches of ~100 vectors
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    await index.upsert(vectors.slice(i, i + batchSize));
  }

  return vectors.length;
};

/**
 * Queries Pinecone for the top-K most relevant chunks to a question embedding.
 */
const queryChunks = async (queryEmbedding, topK = 5, filter = undefined) => {
  const index = getPineconeIndex();
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    ...(filter ? { filter } : {}),
  });
  return results.matches || [];
};

/**
 * Deletes all vectors belonging to a document (by metadata filter).
 */
const deleteDocumentVectors = async (documentId) => {
  const index = getPineconeIndex();
  await index.deleteMany({ documentId: String(documentId) });
};

module.exports = { upsertChunks, queryChunks, deleteDocumentVectors };
