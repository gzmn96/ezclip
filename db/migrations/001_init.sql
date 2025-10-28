CREATE TABLE IF NOT EXISTS video (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chunk (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES video(id),
    index INTEGER NOT NULL,
    start_sec INTEGER NOT NULL,
    end_sec INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scene (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER NOT NULL REFERENCES chunk(id),
    start_sec INTEGER NOT NULL,
    end_sec INTEGER NOT NULL,
    labels JSONB,
    score NUMERIC,
    reason TEXT,
    bboxes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clip (
    id SERIAL PRIMARY KEY,
    scene_id INTEGER NOT NULL REFERENCES scene(id),
    path_916 TEXT,
    path_1x1 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publish_job (
    id SERIAL PRIMARY KEY,
    clip_id INTEGER NOT NULL REFERENCES clip(id),
    target TEXT NOT NULL,
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
