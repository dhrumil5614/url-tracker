const { customAlphabet } = require('nanoid');

/**
 * Generate a unique short code for URLs
 * Uses nanoid with custom alphabet (alphanumeric only, no special chars)
 * Default length is 7 characters for a good balance of uniqueness and brevity
 */

// Custom alphabet: alphanumeric characters only (no ambiguous characters like 0, O, I, l)
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 7);

/**
 * Generate a random short code
 * @returns {string} A unique 7-character short code
 */
const generateShortCode = () => {
  return nanoid();
};

/**
 * Validate if a string is a valid short code format
 * @param {string} code - The code to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidShortCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  // Check if code matches our alphabet and length requirements (4-10 chars)
  return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{4,10}$/.test(code);
};

module.exports = {
  generateShortCode,
  isValidShortCode
};
