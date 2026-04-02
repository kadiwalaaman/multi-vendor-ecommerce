from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import redis
import json

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis client
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    print("✅ Redis connected!")
except:
    redis_client = None
    print("⚠️ Redis not available — running without cache")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def cache_get(key: str):
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except:
        return None

def cache_set(key: str, value, expire: int = 300):
    if not redis_client:
        return
    try:
        redis_client.setex(key, expire, json.dumps(value))
    except:
        pass

def cache_delete(key: str):
    if not redis_client:
        return
    try:
        redis_client.delete(key)
    except:
        pass