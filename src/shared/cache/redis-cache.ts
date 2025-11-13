import redis from "../../config/client-redis";


export class RedisCache {
  /**
   * Set data in Redis with JSON stringify
   */
  async set(key: string, value: any, ttl: number = 60) {
    const stringValue = JSON.stringify(value);
    await redis.set(key, stringValue, "EX", ttl); // expire after ttl seconds
  }

  /**
   * Get data from Redis with JSON parse
   */
  async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  /**
   * Delete key
   */
  async delete(key: string) {
    await redis.del(key);
  }
}
