resource "google_cloud_run_v2_service" "webhook" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = var.webhook_image

      env {
        name  = "TMP_DIR"
        value = "/app/tmp"
      }

      env {
        name = "YT_HUB_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.yt_hub_secret.id
            version = "latest"
          }
        }
      }

      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_url.id
            version = "latest"
          }
        }
      }
      ports { container_port = 3000 }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }
}

resource "google_cloud_run_service_iam_member" "invoker" {
  count    = var.allow_unauthenticated ? 1 : 0
  location = google_cloud_run_v2_service.webhook.location
  project  = google_cloud_run_v2_service.webhook.project
  service  = google_cloud_run_v2_service.webhook.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "cloud_run_uri" {
  value = google_cloud_run_v2_service.webhook.uri
}

