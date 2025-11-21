// Simple in-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const apiCache = new Cache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

// Helper function to create cache keys
export function createCacheKey(prefix: string, ...args: (string | number)[]): string {
  return `${prefix}:${args.join(':')}`;
}

// User cache with longer TTL since user data doesn't change often
export const userCache = new Cache();
export const USER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export function getCachedUser(auth0Id: string) {
  return userCache.get(`user:${auth0Id}`);
}

export function setCachedUser(auth0Id: string, user: unknown) {
  userCache.set(`user:${auth0Id}`, user, USER_CACHE_TTL);
}

export function invalidateUserCache(auth0Id: string) {
  userCache.delete(`user:${auth0Id}`);
}

// Dashboard cache with shorter TTL since it changes more frequently
export const DASHBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
export const TOURS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const MERCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes