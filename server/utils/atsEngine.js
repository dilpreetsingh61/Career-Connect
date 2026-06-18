const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at', 
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could', 
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 
  'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 
  'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 
  'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 
  'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 
  'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 
  'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'will', 'must', 'skills', 'experience', 'years', 'looking', 'join', 
  'team', 'role', 'work', 'working', 'ability', 'knowledge', 'understanding', 'using', 'used', 'strong', 'good', 'excellent',
  'required', 'preferred', 'plus', 'requirements', 'responsibilities', 'candidates', 'candidate'
]);

function tokenize(text) {
  if (!text) return [];
  // Extract words and tech tokens (e.g. c++, node.js, #c) ignoring surrounding punctuation
  // Pattern: alphanumeric characters optionally including #, +, ., - but not starting/ending with them.
  // A simpler approach: extract sequences of alphanumeric plus #, +, ., -
  const tokens = text.toLowerCase().match(/[a-z0-9#+.-]+/g) || [];
  return tokens.filter(t => {
    // Remove tokens that are purely punctuation or numbers
    if (/^[^a-z]+$/.test(t)) return false;
    // Remove if in stopwords
    if (STOP_WORDS.has(t)) return false;
    // Length restriction: allow 2 chars (e.g., UI, UX, JS, Go), skip 1 char unless it's specific (e.g., 'c')
    if (t.length < 2 && t !== 'c' && t !== 'r') return false;
    return true;
  });
}

/**
 * Calculates ATS score based on JD text, explicit tags, and parsed resume text.
 * @param {string} resumeText 
 * @param {string} jdText 
 * @param {Array<string>} jobTags 
 * @returns {Object} score result { score, matchedKeywords, missingKeywords }
 */
function calculateATSScore(resumeText, jdText, jobTags = []) {
  const resumeTokens = new Set(tokenize(resumeText));
  
  // Extract keywords from JD text
  const jdTokens = tokenize(jdText);
  const jdFreq = {};
  jdTokens.forEach(t => {
    jdFreq[t] = (jdFreq[t] || 0) + 1;
  });

  // Extract keywords from Tags (give them heavy weight)
  const tagTokens = new Set();
  jobTags.forEach(tag => {
    tokenize(tag).forEach(t => tagTokens.add(t));
  });

  // Identify core keywords to check. 
  // We'll take all Tag tokens + top frequent JD tokens (up to 20 words)
  const sortedJdTokens = Object.entries(jdFreq)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 30); // Top 30 keywords from description
    
  const allTargetKeywords = new Set([...tagTokens, ...sortedJdTokens]);

  let matchedWeight = 0;
  let totalWeight = 0;
  const matchedKeywords = [];
  const missingKeywords = [];

  allTargetKeywords.forEach(keyword => {
    // Determine weight: Explicit tags are weight 3. Regular keywords are weight 1.
    const weight = tagTokens.has(keyword) ? 3 : 1;
    totalWeight += weight;

    if (resumeTokens.has(keyword)) {
      matchedWeight += weight;
      matchedKeywords.push(keyword);
    } else {
      // Sometimes tokens in resume might have different forms, e.g. "react.js" vs "react"
      // Basic fallback: check if keyword exists as substring in raw resume text if token match fails
      // This helps catch cases where tokenization missed it due to weird delimiters
      if (resumeText.toLowerCase().includes(keyword)) {
        matchedWeight += weight;
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }
  });

  let score = 0;
  if (totalWeight > 0) {
    score = Math.round((matchedWeight / totalWeight) * 100);
  }

  // Cap at 100
  score = Math.min(100, score);

  return {
    score,
    matchedKeywords,
    missingKeywords
  };
}

module.exports = {
  calculateATSScore,
  tokenize
};
