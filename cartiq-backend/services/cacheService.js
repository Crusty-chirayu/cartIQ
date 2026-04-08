// services/cacheService.js

// 🔴 Redis DISABLED (development mode)

console.log("⚠️ Redis disabled (dev mode)");

// Dummy cache (no Redis)
const DEFAULT_TTL = 300;

// Get value
const get = async (key) => {
  return null;
};

// Set value
const set = async (key, value, ttl = DEFAULT_TTL) => {
  return true;
};

// Delete key
const del = async (key) => {
  return true;
};

// Delete multiple keys
const delMany = async (keys) => {
  return true;
};

// Clear pattern
const clearPattern = async (pattern) => {
  return true;
};

// Invalidate user cache
const invalidateUser = async (userId) => {
  return true;
};

// Invalidate product cache
const invalidateProduct = async (productId) => {
  return true;
};

// Get or set
const getOrSet = async (key, fetcher, ttl = DEFAULT_TTL) => {
  try {
    return await fetcher();
  } catch (error) {
    console.error("Cache GetOrSet Error:", error);
    return null;
  }
};

// Dummy redis object (to prevent crashes)
const redis = {
  on: () => {},
};

module.exports = {
  redis,
  get,
  set,
  del,
  delMany,
  clearPattern,
  invalidateUser,
  invalidateProduct,
  getOrSet,
};