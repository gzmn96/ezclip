locals {
  gcp_tmp_dir = "/app/tmp"
}

resource "google_cloud_run_v2_job" "ingest" {
  count    = var.ingest_image != null && var.ingest_image != "" ? 1 : 0
  name     = "${var.service_name}-ingest"
  location = var.region

  template {
    template {
      containers {
        image = var.ingest_image
        env { name = "TMP_DIR" value = local.gcp_tmp_dir }
        env { name = "REDIS_URL" value_source { secret_key_ref { secret = google_secret_manager_secret.redis_url.id version = "latest" } } }
        env { name = "GCS_BUCKET" value = coalesce(var.gcs_bucket_name, try(google_storage_bucket.media[0].name, null)) }
      }
      max_retries = 3
    }
  }
}

resource "google_cloud_run_v2_job" "analyze" {
  count    = var.analyze_image != null && var.analyze_image != "" ? 1 : 0
  name     = "${var.service_name}-analyze"
  location = var.region
  template {
    template {
      containers {
        image = var.analyze_image
        env { name = "TMP_DIR" value = local.gcp_tmp_dir }
        env { name = "REDIS_URL" value_source { secret_key_ref { secret = google_secret_manager_secret.redis_url.id version = "latest" } } }
        env { name = "GCS_BUCKET" value = coalesce(var.gcs_bucket_name, try(google_storage_bucket.media[0].name, null)) }
      }
      max_retries = 3
    }
  }
}

resource "google_cloud_run_v2_job" "clipper" {
  count    = var.clipper_image != null && var.clipper_image != "" ? 1 : 0
  name     = "${var.service_name}-clipper"
  location = var.region
  template {
    template {
      containers {
        image = var.clipper_image
        env { name = "TMP_DIR" value = local.gcp_tmp_dir }
        env { name = "REDIS_URL" value_source { secret_key_ref { secret = google_secret_manager_secret.redis_url.id version = "latest" } } }
        env { name = "GCS_BUCKET" value = coalesce(var.gcs_bucket_name, try(google_storage_bucket.media[0].name, null)) }
      }
      max_retries = 3
    }
  }
}

output "gcp_jobs" {
  value = {
    ingest  = try(google_cloud_run_v2_job.ingest[0].name, null)
    analyze = try(google_cloud_run_v2_job.analyze[0].name, null)
    clipper = try(google_cloud_run_v2_job.clipper[0].name, null)
  }
}

