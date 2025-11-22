# Quick Start

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- FFmpeg installed locally for tests

## Install dependencies
```
npm install
```

## Environment variables
Copy `.env.example` to `.env` and set secrets. For local testing, set `SAMPLE_VIDEO_PATH` to the bundled sample video or your own asset.

## Run tests
```
npm test
```

## Lint
```
npm run lint
```

## Build
```
npm run build
```

## Run with Docker Compose
```
npm run compose:up
```

This builds each service, starts Postgres, Redis, and all workers/webhook service. Temporary files live in `./tmp`.

## Tear down
```
npm run compose:down
```
