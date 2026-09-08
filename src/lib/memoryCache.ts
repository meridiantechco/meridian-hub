/**
 * In-memory client-side cache with Time-To-Live (TTL) and tagging
 * Prevents redundant Supabase queries during rapid tab navigation and tab switching.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  tags?: string[];
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds = 30, tags: string[] = []): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
      tags,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidateTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateKey(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Helper to fetch with cache: if in cache and valid, returns cached.
   * Otherwise executes fetcher and caches result.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 30,
    tags: string[] = [],
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttlSeconds, tags);
    return data;
  }
}

export const memoryCache = new MemoryCache();
