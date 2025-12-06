/**
 * Simple in-memory API cache for client-side performance optimization
 * Reduces redundant API calls and improves response times
 */

class ApiCache {
  constructor(maxAge = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  /**
   * Generate cache key from URL and params
   */
  getKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${url}${sortedParams ? `?${sortedParams}` : ''}`;
  }

  /**
   * Get cached response if available and not expired
   */
  get(url, params = {}) {
    const key = this.getKey(url, params);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Store response in cache
   */
  set(url, params = {}, data) {
    const key = this.getKey(url, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(url, params = {}) {
    const key = this.getKey(url, params);
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Cleanup expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 60 * 1000);
}
