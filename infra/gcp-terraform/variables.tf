variable "environment" {
  description = "Environment name (test or prod)"
  type        = string
}

variable "redis_tier" {
  description = "Memorystore tier (BASIC or STANDARD_HA)"
  type        = string
  default     = "BASIC"
}

variable "redis_size_gb" {
  description = "Memory size for Memorystore instance"
  type        = number
  default     = 1
}

variable "webhook_image" {
  description = "Container image (with digest) for webhook Cloud Run service"
  type        = string
}

variable "ingest_image" {
  description = "Container image (with digest) for ingest Cloud Run job"
  type        = string
}

variable "analyze_image" {
  description = "Container image (with digest) for analyze Cloud Run job"
  type        = string
}

variable "clipper_image" {
  description = "Container image (with digest) for clipper Cloud Run job"
  type        = string
}

variable "publish_image" {
  description = "Container image (with digest) for publish Cloud Run service"
  type        = string
}

variable "yt_hub_secret" {
  description = "YouTube Hub secret for webhook validation"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Postgres connection string for this environment"
  type        = string
  sensitive   = true
}
