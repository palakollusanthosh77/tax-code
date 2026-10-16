const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('[Gemini] GEMINI_API_KEY not set. AI features will fail until configured.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-pro';

module.exports = { genAI, EMBEDDING_MODEL, CHAT_MODEL };
