/**
 * Notes Cache (Extends RedisCache)
 * --------------------------------
 * - Special caching logic for user notes
 * - Caches paginated note results
 */

import redis from "../../config/client-redis";
import { RedisCache } from "../../shared/cache/redis-cache";

export interface NotesCacheData {
  notes: any[];
  total: number;
  currentPage: number;
  totalPages: number;
}

 class NotesCache extends RedisCache {
  private buildKey(userId: string, page: number, limit: number) {
    return `notes:${userId}:page:${page}:limit:${limit}`;
  }

  /**
   * Save paginated notes
   */
  async setNotes(userId: string, page: number, limit: number, data: NotesCacheData) {
    const key = this.buildKey(userId, page, limit);
    await this.set(key, data, 60); // cache for 60 seconds
  }

  /**
   * Fetch cached notes
   */
  async getNotes(userId: string, page: number, limit: number) {
    const key = this.buildKey(userId, page, limit);
    return await this.get<NotesCacheData>(key);
  }

  /**
   * Clear all cache for user (useful on note create/update/delete)
   */
  async clearUserNotes(userId: string) {
    const keys = await redis.keys(`notes:${userId}:*`);
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
export const notesCache = new NotesCache();