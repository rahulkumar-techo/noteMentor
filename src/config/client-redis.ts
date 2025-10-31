
import Redis from "ioredis"
import {config} from "./env.config"
import { log } from "../shared/logs/logger";

const redis = new Redis(config?.redis?.redis_uri);

redis.on('connect', () => log.info('🔴 Connected to Redis'));
redis.on('error', (err) => log.error('Redis error', err));

export default redis;