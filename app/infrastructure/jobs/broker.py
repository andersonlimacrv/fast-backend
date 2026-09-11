"""Taskiq brokers: Redis in prod (ListQueueBroker), in-memory for tests."""

from taskiq import AsyncBroker, InMemoryBroker

from app.core.settings import Settings


def build_broker(settings: Settings, *, in_memory: bool = False) -> AsyncBroker:
    if in_memory:
        return InMemoryBroker()
    from taskiq_redis import ListQueueBroker, RedisAsyncResultBackend

    return ListQueueBroker(
        url=settings.task_broker_url,
        result_backend=RedisAsyncResultBackend(redis_url=settings.task_broker_url),
    )
