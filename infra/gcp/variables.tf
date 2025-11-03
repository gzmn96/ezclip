variable "webhook_image" {
  description = "Container image for Cloud Run webhook (e.g., us-central1-docker.pkg.dev/PROJECT/REPO/ezclip-webhook:tag)"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "ezclip-webhook"
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated invokes"
  type        = bool
  default     = true
}

variable "yt_hub_secret" {
  description = "YT Hub secret for webhook"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis URL reachable from Cloud Run (recommended: Upstash/Redis Cloud)"
  type        = string
}

variable "gcs_bucket_name" {
  description = "GCS bucket name for raw/working assets"
  type        = string
  default     = null
}

variable "ingest_image" {
  description = "Container image for ingest job (GAR URI, can be @sha digest)"
  type        = string
  default     = null
}

variable "analyze_image" {
  description = "Container image for analyze job (GAR URI, can be @sha digest)"
  type        = string
  default     = null
}

variable "clipper_image" {
  description = "Container image for clipper job (GAR URI, can be @sha digest)"
  type        = string
  default     = null
}
