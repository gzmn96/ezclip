variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "alb_ingress_cidrs" {
  description = "CIDR blocks allowed to access ALB"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "desired_count_webhook" {
  description = "Desired count for webhook service"
  type        = number
  default     = 1
}

variable "desired_count_workers" {
  description = "Desired count for worker services"
  type        = number
  default     = 1
}

variable "container_cpu" {
  description = "CPU units per task"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Memory (MiB) per task"
  type        = number
  default     = 512
}

variable "enable_rds" {
  description = "Whether to provision Postgres RDS"
  type        = bool
  default     = false
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "external_redis_url" {
  description = "If set, use this Redis URL instead of provisioning ElastiCache (e.g., Upstash/Redis Cloud public endpoint)."
  type        = string
  default     = null
}

variable "yt_hub_secret" {
  description = "YouTube Hub secret (will be stored in SSM)"
  type        = string
  sensitive   = true
}

variable "use_sample_video" {
  description = "Whether to mount a sample video path for ingest (test env only)"
  type        = bool
  default     = false
}

variable "images" {
  description = "Map of service images (full ECR image URIs with tags)"
  type = object({
    webhook = string
    ingest  = string
    analyze = string
    clipper = string
    publish = string
  })
}

variable "deploy_webhook_on_aws" {
  description = "Whether to deploy webhook service on AWS (otherwise deploy on GCP)."
  type        = bool
  default     = false
}

variable "deploy_ingest_on_aws" {
  description = "Whether to deploy ingest worker on AWS (set false if running on GCP)."
  type        = bool
  default     = true
}

variable "deploy_analyze_on_aws" {
  description = "Whether to deploy analyze worker on AWS (set false if running on GCP)."
  type        = bool
  default     = true
}

variable "deploy_clipper_on_aws" {
  description = "Whether to deploy clipper worker on AWS (set false if running on GCP)."
  type        = bool
  default     = true
}

variable "deploy_publish_on_aws" {
  description = "Whether to deploy publish worker on AWS (usually true)."
  type        = bool
  default     = true
}
