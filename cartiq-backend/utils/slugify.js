// c:\Users\chira\cartIQ\cartiq-backend\utils\slugify.js

/**
 * Convert text to URL-friendly slug
 */
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with one
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Generate unique slug with random suffix
 */
const generateUniqueSlug = (text) => {
  const base = slugify(text);
  const suffix = Math.random().toString(36).substring(2, 9);
  return `${base}-${suffix}`;
};

module.exports = {
  slugify,
  generateUniqueSlug,
};
