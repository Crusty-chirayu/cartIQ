// c:\Users\chira\cartIQ\cartiq-backend\utils\promptSanitizer.js

/**
 * Sanitize user input to prevent prompt injection attacks
 * Escape special characters and remove potentially dangerous patterns
 */
const sanitizePromptInput = (input) => {
  if (typeof input !== "string") return "";

  let sanitized = input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove SQL inject patterns
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi, "")
    // Escape quotes
    .replace(/['"]/g, "\\'")
    // Trim whitespace
    .trim();

  return sanitized;
};

/**
 * Escape special characters in prompt for LLM injection prevention
 */
const escapeForPrompt = (text) => {
  return text.replace(/[{}[\]"']/g, "\\$&");
};

/**
 * Remove common prompt injection phrases
 */
const removeInjectionPatterns = (input) => {
  const injectionPatterns = [
    /ignore previous instructions/gi,
    /forget everything you were told/gi,
    /you are now/gi,
    /pretend you are/gi,
    /roleplay/gi,
    /system prompt/gi,
  ];

  let sanitized = input;
  injectionPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  return sanitized;
};

/**
 * Complete sanitization pipeline
 */
const sanitizeUserInput = (input) => {
  let sanitized = sanitizePromptInput(input);
  sanitized = removeInjectionPatterns(sanitized);
  sanitized = escapeForPrompt(sanitized);
  return sanitized.slice(0, 5000); // Max 5000 chars
};

module.exports = {
  sanitizePromptInput,
  escapeForPrompt,
  removeInjectionPatterns,
  sanitizeUserInput,
};
