from fastapi import APIRouter

from app.api.routes import actions, buckets, health, knowledge, people, qibits, review, threads, timeline

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(buckets.router, prefix="/buckets", tags=["buckets"])
api_router.include_router(qibits.router, prefix="/qibits", tags=["qibits"])
api_router.include_router(threads.router, prefix="/threads", tags=["threads"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(people.router, prefix="/people", tags=["people"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
api_router.include_router(review.router, prefix="/review", tags=["review"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
