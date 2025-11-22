locals {
  repo_name        = "ezclip-repo"
  raw_bucket_name  = "ezclip-${var.environment}-raw-videos"
  tmp_bucket_name  = "ezclip-${var.environment}-tmp"
  logs_bucket_name = "ezclip-${var.environment}-logs"
  network_name     = "ezclip-${var.environment}-network"
  subnetwork_name  = "ezclip-${var.environment}-subnet"
  connector_name   = "ezclip-${var.environment}-connector"
  redis_name       = "ezclip-${var.environment}-redis"
  labels = {
    project     = "ezclip"
    environment = var.environment
  }
}

resource "google_project_service" "services" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "redis.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "logging.googleapis.com",
    "storage.googleapis.com",
    "vpcaccess.googleapis.com"
  ])
  project = var.project_id
  service = each.key
}

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = local.repo_name
  description   = "Docker repository for ezclip"
  format        = "DOCKER"
  depends_on    = [google_project_service.services]
}

resource "google_storage_bucket" "raw" {
  name                        = local.raw_bucket_name
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
  labels                      = local.labels
}

resource "google_storage_bucket" "tmp" {
  name                        = local.tmp_bucket_name
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
  labels                      = local.labels
}

resource "google_storage_bucket" "logs" {
  name                        = local.logs_bucket_name
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
  retention_policy {
    retention_period = 60 * 60 * 24 * 30
  }
  labels = local.labels
}

resource "google_compute_network" "main" {
  name                    = local.network_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "main" {
  name          = local.subnetwork_name
  region        = var.region
  network       = google_compute_network.main.id
  ip_cidr_range = "10.10.0.0/24"
}

resource "google_vpc_access_connector" "serverless" {
  name           = local.connector_name
  region         = var.region
  network        = google_compute_network.main.name
  ip_cidr_range  = "10.8.0.0/28"
  min_throughput = 200
  max_throughput = 300
}

resource "google_redis_instance" "redis" {
  name                    = local.redis_name
  tier                    = var.redis_tier
  memory_size_gb          = var.redis_size_gb
  region                  = var.region
  authorized_network      = google_compute_network.main.id
  transit_encryption_mode = "SERVER_AUTHENTICATION"
  labels                  = local.labels
}

resource "google_secret_manager_secret" "yt_hub" {
  secret_id = "yt-hub-secret-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "yt_hub" {
  secret      = google_secret_manager_secret.yt_hub.id
  secret_data = var.yt_hub_secret
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "redis-url-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = "redis://${google_redis_instance.redis.host}:6379"
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = var.database_url
}

locals {
  service_configs = {
    webhook = { description = "Cloud Run service for webhook" }
    publish = { description = "Cloud Run service for publisher" }
    ingest  = { description = "Cloud Run job for ingest" }
    analyze = { description = "Cloud Run job for analyze" }
    clipper = { description = "Cloud Run job for clipper" }
  }
}

resource "google_service_account" "services" {
  for_each     = local.service_configs
  account_id   = "ezclip-${var.environment}-${each.key}"
  display_name = "ezclip ${each.key} ${var.environment}"
}

resource "google_project_iam_member" "artifact_registry_reader" {
  for_each = google_service_account.services
  project  = var.project_id
  role     = "roles/artifactregistry.reader"
  member   = "serviceAccount:${each.value.email}"
}

resource "google_project_iam_member" "secret_accessor" {
  for_each = google_service_account.services
  project  = var.project_id
  role     = "roles/secretmanager.secretAccessor"
  member   = "serviceAccount:${each.value.email}"
}

resource "google_project_iam_member" "redis_client" {
  for_each = google_service_account.services
  project  = var.project_id
  role     = "roles/redis.client"
  member   = "serviceAccount:${each.value.email}"
}

resource "google_project_iam_member" "log_writer" {
  for_each = google_service_account.services
  project  = var.project_id
  role     = "roles/logging.logWriter"
  member   = "serviceAccount:${each.value.email}"
}

locals {
  bucket_access = flatten([
    for entry in [
      {
        service = "ingest"
        buckets = [google_storage_bucket.raw.name, google_storage_bucket.tmp.name]
      },
      {
        service = "analyze"
        buckets = [google_storage_bucket.raw.name, google_storage_bucket.tmp.name]
      },
      {
        service = "clipper"
        buckets = [google_storage_bucket.raw.name, google_storage_bucket.tmp.name]
      },
      {
        service = "publish"
        buckets = [google_storage_bucket.raw.name]
      }
      ] : [for bucket in entry.buckets : {
        key     = "${entry.service}-${bucket}"
        service = entry.service
        bucket  = bucket
    }]
  ])
}

resource "google_storage_bucket_iam_member" "bucket_access" {
  for_each = { for item in local.bucket_access : item.key => item }
  bucket   = each.value.bucket
  role     = "roles/storage.objectAdmin"
  member   = "serviceAccount:${google_service_account.services[each.value.service].email}"
}

resource "google_logging_project_sink" "all" {
  name                   = "ezclip-${var.environment}-sink"
  destination            = "storage.googleapis.com/${google_storage_bucket.logs.name}"
  filter                 = "resource.type=\"cloud_run_revision\" OR resource.type=\"cloud_run_job\""
  unique_writer_identity = true
}

resource "google_storage_bucket_iam_member" "logs_sink_writer" {
  bucket = google_storage_bucket.logs.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.all.writer_identity
}

resource "google_cloud_run_v2_service" "webhook" {
  provider = google-beta
  name     = "ezclip-webhook"
  location = var.region
  labels   = local.labels

  template {
    service_account = google_service_account.services["webhook"].email
    scaling {
      min_instance_count = 1
      max_instance_count = 5
    }
    containers {
      image = var.webhook_image
      ports {
        container_port = 3000
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "TMP_DIR"
        value = "/app/tmp"
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.raw.name
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
      env {
        name = "YT_HUB_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.yt_hub.id
            version = "latest"
          }
        }
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.id
            version = "latest"
          }
        }
      }
      readiness_probe {
        http_get {
          path = "/health"
          port = 3000
        }
        failure_threshold     = 3
        initial_delay_seconds = 5
        timeout_seconds       = 2
        period_seconds        = 10
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.serverless.id
      egress    = "ALL_TRAFFIC"
    }
  }
  ingress = "INGRESS_TRAFFIC_ALL"
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service_iam_member" "webhook_invoker" {
  provider = google-beta
  name     = google_cloud_run_v2_service.webhook.name
  location = google_cloud_run_v2_service.webhook.location
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "publish" {
  provider = google-beta
  name     = "ezclip-publish"
  location = var.region
  labels   = local.labels

  template {
    service_account = google_service_account.services["publish"].email
    scaling {
      min_instance_count = 1
      max_instance_count = 3
    }
    containers {
      image = var.publish_image
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "TMP_DIR"
        value = "/app/tmp"
      }
      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.raw.name
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "PROJECT_ID"
        value = var.project_id
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
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.id
            version = "latest"
          }
        }
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.serverless.id
      egress    = "ALL_TRAFFIC"
    }
  }
  ingress = "INGRESS_TRAFFIC_INTERNAL_ONLY"
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

locals {
  jobs = {
    ingest  = var.ingest_image
    analyze = var.analyze_image
    clipper = var.clipper_image
  }
}

resource "google_cloud_run_v2_job" "jobs" {
  provider = google-beta
  for_each = local.jobs
  name     = "ezclip-${each.key}"
  location = var.region
  labels   = local.labels

  template {
    task_count  = 1
    max_retries = 3
    template {
      service_account = google_service_account.services[each.key].email
      volumes {
        name = "tmp-storage"
        gcs {
          bucket = google_storage_bucket.tmp.name
        }
      }
      containers {
        image = each.value
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        env {
          name  = "TMP_DIR"
          value = "/app/tmp"
        }
        env {
          name  = "GCS_BUCKET"
          value = google_storage_bucket.raw.name
        }
        env {
          name  = "ENVIRONMENT"
          value = var.environment
        }
        env {
          name  = "PROJECT_ID"
          value = var.project_id
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
        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.database_url.id
              version = "latest"
            }
          }
        }
        volume_mounts {
          name       = "tmp-storage"
          mount_path = "/app/tmp"
        }
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.serverless.id
      egress    = "ALL_TRAFFIC"
    }
  }
}
