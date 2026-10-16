const { genAI, CHAT_MODEL } = require('../config/gemini');

/**
 * Calls Gemini with a plain text prompt and returns the raw text response.
 */
const generateText = async (prompt, systemInstruction) => {
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Calls Gemini and asks for strict JSON output. Strips markdown fences if present
 * and safely parses the result.
 */
const generateJSON = async (prompt, systemInstruction) => {
  const raw = await generateText(
    prompt,
    (systemInstruction || '') +
      '\nIMPORTANT: Respond with ONLY valid JSON. No markdown formatting, no code fences, no preamble text.'
  );
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini did not return valid JSON: ${err.message}`);
  }
};

module.exports = { generateText, generateJSON };
