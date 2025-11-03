resource "google_storage_bucket" "media" {
  count         = var.gcs_bucket_name == null || var.gcs_bucket_name == "" ? 1 : 0
  name          = "${var.project_id}-${var.service_name}-media"
  location      = var.region
  storage_class = "STANDARD"
  uniform_bucket_level_access = true

  lifecycle_rule {
    action { type = "Delete" }
    condition { age = 30 }
  }
}

output "gcs_bucket" {
  value = coalesce(var.gcs_bucket_name, try(google_storage_bucket.media[0].name, null))
}

