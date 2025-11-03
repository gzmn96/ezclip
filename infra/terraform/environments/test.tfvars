aws_region            = "us-east-1"
project_name          = "ezclip"
environment           = "test"
desired_count_webhook = 1
desired_count_workers = 1
container_cpu         = 256
container_memory      = 512
use_sample_video      = true
redis_node_type       = "cache.t3.micro"
enable_rds            = false
# Placeholder; Jenkins should pass real images per build
images = {
  webhook = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-webhook:test-latest"
  ingest  = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-ingest:test-latest"
  analyze = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-analyze:test-latest"
  clipper = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-clipper:test-latest"
  publish = "123456789012.dkr.ecr.us-east-1.amazonaws.com/ezclip-publish:test-latest"
}
# Sensitive var; Jenkins should set via -var or TF_VAR_yt_hub_secret
yt_hub_secret = "CHANGE_ME_TEST"

