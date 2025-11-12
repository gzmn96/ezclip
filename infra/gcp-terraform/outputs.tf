output "webhook_url" {
  description = "Public URL for the webhook Cloud Run service"
  value       = google_cloud_run_v2_service.webhook.uri
}

output "redis_host" {
  description = "Memorystore Redis host"
  value       = google_redis_instance.redis.host
}

output "artifact_registry_url" {
  description = "Artifact Registry repository endpoint"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${local.repo_name}"
}

output "raw_bucket" {
  description = "GCS bucket for raw video storage"
  value       = google_storage_bucket.raw.name
}

output "tmp_bucket" {
  description = "GCS bucket mounted at /app/tmp"
  value       = google_storage_bucket.tmp.name
}
