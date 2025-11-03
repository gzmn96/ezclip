aws_region            = "us-east-1"
project_name          = "ezclip"
environment           = "prod"
desired_count_webhook = 2
desired_count_workers = 2
container_cpu         = 512
container_memory      = 1024
use_sample_video      = false
redis_node_type       = "cache.t3.small"
enable_rds            = false
images = {
  webhook = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-webhook:prod-latest"
  ingest  = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-ingest:prod-latest"
  analyze = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-analyze:prod-latest"
  clipper = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-clipper:prod-latest"
  publish = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-publish:prod-latest"
}
yt_hub_secret = "CHANGE_ME_PROD"

