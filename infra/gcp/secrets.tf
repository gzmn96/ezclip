resource "google_secret_manager_secret" "yt_hub_secret" {
  secret_id = "${var.service_name}-YT_HUB_SECRET"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "yt_hub_secret" {
  secret      = google_secret_manager_secret.yt_hub_secret.id
  secret_data = var.yt_hub_secret
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "${var.service_name}-REDIS_URL"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = var.redis_url
}

