import { pgTable, uuid, text, timestamp, integer, boolean, numeric, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

// --- USERS & AUTH ---
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow(),
    lastLogin: timestamp('last_login'),
});

export const oauthConnections = pgTable('oauth_connections', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    platform: text('platform'), // 'youtube', 'tiktok', 'instagram'
    platformUserId: text('platform_user_id'),
    accessToken: text('access_token'), // encrypted
    refreshToken: text('refresh_token'), // encrypted
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- SUBSCRIPTIONS & BILLING ---
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    plan: text('plan'), // 'starter', 'creator', 'pro', 'enterprise'
    status: text('status'), // 'active', 'canceled', 'past_due', 'trialing'
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end'),
    trialEndsAt: timestamp('trial_ends_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const usageLimits = pgTable('usage_limits', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    clipsQuota: integer('clips_quota'),
    clipsUsed: integer('clips_used').default(0),
    channelsQuota: integer('channels_quota'),
    channelsUsed: integer('channels_used').default(0),
});

export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    stripePaymentId: text('stripe_payment_id'),
    amountCents: integer('amount_cents'),
    currency: text('currency'),
    status: text('status'),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- VIDEO PROCESSING ---
export const videos = pgTable('videos', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    youtubeVideoId: text('youtube_video_id').unique(),
    channelId: text('channel_id'),
    title: text('title'),
    durationSeconds: integer('duration_seconds'),
    processingStatus: text('processing_status'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const chunks = pgTable('chunks', {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('video_id').references(() => videos.id),
    chunkIndex: integer('chunk_index'),
    startSec: numeric('start_sec'),
    endSec: numeric('end_sec'),
    storagePath: text('storage_path'),
    analysisCompleted: boolean('analysis_completed'),
});

export const scenes = pgTable('scenes', {
    id: uuid('id').primaryKey().defaultRandom(),
    chunkId: uuid('chunk_id').references(() => chunks.id),
    startSec: numeric('start_sec'),
    endSec: numeric('end_sec'),
    viralScore: numeric('viral_score'),
    labels: jsonb('labels'),
    objectsTracked: jsonb('objects_tracked'),
    gptAnalysis: jsonb('gpt_analysis'),
});

export const clips = pgTable('clips', {
    id: uuid('id').primaryKey().defaultRandom(),
    sceneId: uuid('scene_id').references(() => scenes.id),
    userId: uuid('user_id').references(() => users.id),
    format: text('format'), // '9x16', '1x1'
    storagePath: text('storage_path'),
    thumbnailPath: text('thumbnail_path'),
    durationSec: numeric('duration_sec'),
    viewCount: integer('view_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

export const publishedPosts = pgTable('published_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    clipId: uuid('clip_id').references(() => clips.id),
    platform: text('platform'), // 'youtube_shorts', 'tiktok', 'instagram_reels'
    platformPostId: text('platform_post_id'),
    postUrl: text('post_url'),
    status: text('status'),
    publishedAt: timestamp('published_at'),
});

// --- ANALYTICS & COSTS ---
export const apiCosts = pgTable('api_costs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    videoId: uuid('video_id').references(() => videos.id),
    service: text('service'), // 'video_intelligence', 'gpt4o', 'speech_to_text'
    costUsd: numeric('cost_usd', { precision: 10, scale: 4 }),
    details: jsonb('details'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const viralMetrics = pgTable('viral_metrics', {
    id: uuid('id').primaryKey().defaultRandom(),
    clipId: uuid('clip_id').references(() => clips.id),
    platform: text('platform'),
    views: integer('views'),
    likes: integer('likes'),
    comments: integer('comments'),
    shares: integer('shares'),
    watchTimeSec: integer('watch_time_sec'),
    syncedAt: timestamp('synced_at'),
}, (t) => ({
    uniqueClipPlatform: uniqueIndex('unique_clip_platform').on(t.clipId, t.platform),
}));

// --- PLATFORM INTELLIGENCE ---

export const platformPreferences = pgTable('platform_preferences', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    platform: text('platform'), // 'linkedin', 'tiktok', 'instagram', 'youtube'

    // Tone preferences
    tone: text('tone'), // 'professional', 'casual', 'entertaining', 'educational'

    // Content preferences
    preferredTopics: jsonb('preferred_topics'), // ['tech', 'business', 'finance']
    avoidTopics: jsonb('avoid_topics'), // ['politics', 'controversial']

    // Length preferences
    minDuration: integer('min_duration'), // seconds
    maxDuration: integer('max_duration'),

    // Style preferences
    includeCaptions: boolean('include_captions').default(true),
    includeEmojis: boolean('include_emojis').default(false),
    musicPreference: text('music_preference'), // 'trending', 'none', 'background'

    createdAt: timestamp('created_at').defaultNow()
});

export const platformTrends = pgTable('platform_trends', {
    id: uuid('id').primaryKey().defaultRandom(),
    platform: text('platform').notNull(),

    // Trend data
    trendingTopics: jsonb('trending_topics'), // ['AI', 'productivity', 'work from home']
    trendingSounds: jsonb('trending_sounds'), // For TikTok/Reels
    trendingHashtags: jsonb('trending_hashtags'),

    // Engagement patterns
    optimalLength: integer('optimal_length'), // Average performing length
    bestPostingTime: text('best_posting_time'),

    // Updated daily via API
    scrapedAt: timestamp('scraped_at').defaultNow(),
    expiresAt: timestamp('expires_at')
});

export const platformScores = pgTable('platform_scores', {
    id: uuid('id').primaryKey().defaultRandom(),
    sceneId: uuid('scene_id').references(() => scenes.id),
    platform: text('platform').notNull(),

    // AI scores (0-100)
    viralScore: numeric('viral_score'), // Overall viral potential
    relevanceScore: numeric('relevance_score'), // Match to platform norms
    engagementScore: numeric('engagement_score'), // Predicted engagement

    // Reasoning
    reasoningJson: jsonb('reasoning_json'), // Why this score
    suggestedCaption: text('suggested_caption'),
    suggestedHashtags: jsonb('suggested_hashtags'),

    // Trend matching
    matchesTrend: boolean('matches_trend').default(false),
    trendNames: jsonb('trend_names'),

    createdAt: timestamp('created_at').defaultNow()
});

// --- ADMIN & SUPPORT ---
export const featureFlags = pgTable('feature_flags', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    flagName: text('flag_name'),
    enabled: boolean('enabled'),
    createdAt: timestamp('created_at').defaultNow(),
});
