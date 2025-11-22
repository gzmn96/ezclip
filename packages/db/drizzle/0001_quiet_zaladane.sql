CREATE TABLE IF NOT EXISTS "platform_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"platform" text,
	"tone" text,
	"preferred_topics" jsonb,
	"avoid_topics" jsonb,
	"min_duration" integer,
	"max_duration" integer,
	"include_captions" boolean DEFAULT true,
	"include_emojis" boolean DEFAULT false,
	"music_preference" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scene_id" uuid,
	"platform" text NOT NULL,
	"viral_score" numeric,
	"relevance_score" numeric,
	"engagement_score" numeric,
	"reasoning_json" jsonb,
	"suggested_caption" text,
	"suggested_hashtags" jsonb,
	"matches_trend" boolean DEFAULT false,
	"trend_names" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_trends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"trending_topics" jsonb,
	"trending_sounds" jsonb,
	"trending_hashtags" jsonb,
	"optimal_length" integer,
	"best_posting_time" text,
	"scraped_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_preferences" ADD CONSTRAINT "platform_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_scores" ADD CONSTRAINT "platform_scores_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "scenes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
