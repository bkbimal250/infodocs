"""
Redis Configuration
"""
import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class RedisClient:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            try:
                import redis.asyncio as redis
                redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
                cls._instance = redis.from_url(redis_url, decode_responses=True)
            except ImportError:
                logger.warning("redis-py not installed, caching disabled")
                cls._instance = None
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}")
                cls._instance = None
        return cls._instance

    @classmethod
    async def close(cls):
        if cls._instance:
            await cls._instance.close()
            cls._instance = None

async def get_redis():
    return RedisClient.get_instance()

