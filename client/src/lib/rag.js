/**
 * DocMind AI — RAG Utilities
 * Chunking + TF-IDF keyword retrieval (client-side preview; full retrieval on server)
 */

/**
 * Split a document into overlapping ~500-word chunks at sentence boundaries.
 * @param {string} text      - Raw document text
 * @param {string} filename  - Source filename for attribution
 * @returns {Chunk[]}
 */
export function chunkDocument(text, filename) {
  // Normalise line endings and collapse whitespace runs
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  // Split on sentence-ending punctuation followed by whitespace
  const sentences = cleaned.match(/[^.!?]+[.!?]+[\s]*/g) || [cleaned];

  const chunks = [];
  let currentSentences = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  const TARGET_WORDS = 500;
  const OVERLAP_WORDS = 50;

  for (const sentence of sentences) {
    const wordCount = sentence.trim().split(/\s+/).length;

    if (currentWordCount + wordCount > TARGET_WORDS && currentWordCount > 0) {
      // Emit chunk
      chunks.push({
        id: `${filename}::${chunkIndex}`,
        filename,
        content: currentSentences.join(' ').trim(),
        wordCount: currentWordCount,
        chunkIndex,
      });
      chunkIndex++;

      // Build overlap: keep trailing sentences until ~OVERLAP_WORDS
      const overlapSentences = [];
      let overlapCount = 0;
      for (let i = currentSentences.length - 1; i >= 0; i--) {
        const wc = currentSentences[i].split(/\s+/).length;
        if (overlapCount + wc > OVERLAP_WORDS) break;
        overlapSentences.unshift(currentSentences[i]);
        overlapCount += wc;
      }
      currentSentences = overlapSentences;
      currentWordCount = overlapCount;
    }

    currentSentences.push(sentence);
    currentWordCount += wordCount;
  }

  // Final chunk
  if (currentSentences.length > 0) {
    chunks.push({
      id: `${filename}::${chunkIndex}`,
      filename,
      content: currentSentences.join(' ').trim(),
      wordCount: currentWordCount,
      chunkIndex,
    });
  }

  return chunks;
}

/**
 * TF-IDF keyword retrieval — score each chunk by query term frequency.
 * @param {string}  query   - User question
 * @param {Chunk[]} chunks  - All indexed chunks
 * @param {number}  topK    - How many chunks to return
 * @returns {ScoredChunk[]}
 */
export function retrieveRelevantChunks(query, chunks, topK = 5) {
  // Filter stopwords for better signal
  const STOPWORDS = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'is','it','this','that','are','was','be','have','has','do','does','can',
    'will','would','should','could','not','what','how','why','when','where',
  ]);

  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  if (queryWords.length === 0) return chunks.slice(0, topK);

  const scored = chunks.map((chunk) => {
    const chunkLower = chunk.content.toLowerCase();
    const chunkWords = chunkLower.split(/\s+/);
    const total = chunkWords.length || 1;
    let score = 0;

    for (const qw of queryWords) {
      // Exact match weight
      const exact = chunkWords.filter((w) => w === qw).length;
      // Partial match weight (prefix/contains)
      const partial = chunkWords.filter((w) => w !== qw && w.includes(qw)).length;
      score += (exact * 2 + partial * 0.5) / total;
    }

    // Slight boost for filename match
    if (chunk.filename.toLowerCase().includes(queryWords[0])) score += 0.1;

    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Format file size for display.
 * @param {number} bytes
 * @returns {string}
 */
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file type icon and colour class.
 * @param {string} filename
 * @returns {{ icon: string, colorClass: string }}
 */
export function getFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    md:   { icon: '📘', color: 'blue' },
    txt:  { icon: '📄', color: 'gray' },
    js:   { icon: '📙', color: 'amber' },
    ts:   { icon: '📙', color: 'amber' },
    jsx:  { icon: '📙', color: 'amber' },
    tsx:  { icon: '📙', color: 'amber' },
    py:   { icon: '📗', color: 'green' },
    json: { icon: '📋', color: 'purple' },
    yaml: { icon: '📋', color: 'purple' },
    yml:  { icon: '📋', color: 'purple' },
    html: { icon: '🌐', color: 'red' },
    css:  { icon: '🎨', color: 'pink' },
    csv:  { icon: '📊', color: 'teal' },
    xml:  { icon: '📋', color: 'gray' },
  };
  return map[ext] || { icon: '📄', color: 'gray' };
}

/** Accepted MIME types / extensions for the file picker */
export const ACCEPTED_EXTENSIONS =
  '.txt,.md,.js,.ts,.jsx,.tsx,.py,.json,.yaml,.yml,.html,.css,.csv,.xml';
