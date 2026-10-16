/**
 * Splits raw text into overlapping chunks suitable for embedding.
 * Overlap preserves context across chunk boundaries so semantic search
 * doesn't miss information that straddles a split point.
 *
 * @param {string} text - Raw extracted text
 * @param {number} chunkSize - Target chunk size in characters
 * @param {number} overlap - Number of overlapping characters between chunks
 * @returns {string[]} array of text chunks
 */
function chunkText(text, chunkSize = 1500, overlap = 200) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);

    // Try to break on a sentence/paragraph boundary near the end for cleaner chunks
    if (end < cleaned.length) {
      const lastPeriod = cleaned.lastIndexOf('. ', end);
      if (lastPeriod > start + chunkSize * 0.5) {
        end = lastPeriod + 1;
      }
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = end - overlap;
    if (start < 0) start = 0;
    if (end === cleaned.length) break;
  }

  return chunks.filter((c) => c.length > 20);
}

module.exports = chunkText;
