const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF file on disk.
 * @param {string} filePath
 * @returns {Promise<{text: string, numPages: number}>}
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return { text: data.text, numPages: data.numpages };
};

module.exports = { extractTextFromPDF };
