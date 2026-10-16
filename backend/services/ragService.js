const { embedText } = require('./embeddingService');
const { queryChunks } = require('./pineconeService');
const { generateText } = require('./geminiService');

const NO_INFO_RESPONSE = 'No relevant information found in the uploaded regulatory documents.';

// Below this similarity score, we don't trust the match enough to answer from it.
const MIN_CONFIDENCE_THRESHOLD = 0.55;

/**
 * Core RAG pipeline for the AI Regulatory Search feature.
 * 1. Embed the user's question
 * 2. Retrieve top-K matching chunks from Pinecone
 * 3. If nothing sufficiently relevant is found, refuse rather than hallucinate
 * 4. Otherwise, ask Gemini to answer STRICTLY from the retrieved context
 */
const answerRegulatoryQuestion = async (question, topK = 5) => {
  const queryEmbedding = await embedText(question, 'RETRIEVAL_QUERY');
  const matches = await queryChunks(queryEmbedding, topK);

  const relevant = matches.filter((m) => m.score >= MIN_CONFIDENCE_THRESHOLD);

  if (relevant.length === 0) {
    return {
      answer: NO_INFO_RESPONSE,
      sources: [],
      confidenceScore: 0,
      grounded: false,
    };
  }

  const context = relevant
    .map(
      (m, i) =>
        `[Source ${i + 1}: ${m.metadata.documentTitle}]\n${m.metadata.text}`
    )
    .join('\n\n---\n\n');

  const systemInstruction = `You are TaxCode Insight, an AI compliance assistant for Chartered Accountants.
RULES:
- Answer ONLY using the provided context below. Do not use outside knowledge.
- Never fabricate legal information, sections, or numbers.
- If the context does not contain enough information to answer, say so explicitly.
- Always be precise and cite which source number(s) you used inline, e.g. (Source 1).
- Keep the answer structured and professional, suitable for a compliance report.`;

  const prompt = `CONTEXT:\n${context}\n\nQUESTION: ${question}\n\nProvide a clear, well-structured answer based only on the context above.`;

  const answer = await generateText(prompt, systemInstruction);

  const avgScore = relevant.reduce((sum, m) => sum + m.score, 0) / relevant.length;
  const confidenceScore = Math.round(avgScore * 100);

  const sources = relevant.map((m) => ({
    documentId: m.metadata.documentId,
    documentTitle: m.metadata.documentTitle,
    chunkText: m.metadata.text.slice(0, 300) + (m.metadata.text.length > 300 ? '...' : ''),
    score: Math.round(m.score * 100) / 100,
  }));

  return { answer, sources, confidenceScore, grounded: true };
};

module.exports = { answerRegulatoryQuestion, NO_INFO_RESPONSE };
