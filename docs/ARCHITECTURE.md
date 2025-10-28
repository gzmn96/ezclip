# Architecture

```
YouTube WebSub -> webhook service -> ingest queue -> ingest worker
  -> analyze queue -> analyze worker -> clip queue -> clipper worker
  -> publish queue -> publish worker
```

- **webhook**: Handles WebSub verification and notifications. Enqueues ingest jobs.
- **ingest**: Fetches video metadata (stub), chunks long videos, and enqueues analysis per chunk.
- **analyze**: Stubbed scene detection writing `scenes.json` and enqueuing clip jobs.
- **clipper**: Cuts clips for 9:16 and 1:1 using FFmpeg and enqueues publish jobs.
- **publish**: Stub that logs the clip info. Future work uploads to platforms.

Infrastructure:

- Redis powers BullMQ queues.
- Postgres schema captured in `db/migrations` (future integration in services).
- Docker Compose orchestrates all services for local development.
- GitHub Actions lint/build/test.
