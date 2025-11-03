Ezclip AWS Infra (Terraform)

Overview
- Provisions AWS infra for two environments (test, prod):
  - VPC with public/private subnets + NAT
  - ECR repos for service images
  - ElastiCache Redis (single-node) for BullMQ
  - EFS (shared) mounted to `/app/tmp` for cross-service file sharing
  - ECS Fargate cluster + services: webhook (behind ALB), ingest, analyze, clipper, publish
  - CloudWatch Logs for all tasks
- SSM Parameters for config (REDIS_URL, TMP_DIR, YT_HUB_SECRET, optional SAMPLE_VIDEO_PATH)

Multi-cloud note
- To run webhook on GCP Cloud Run while workers stay on AWS, use a publicly reachable Redis (e.g., Upstash/Redis Cloud) and set `external_redis_url` when applying AWS Terraform. Jenkins pipeline expects a credential named `external-redis-url`.
- If `external_redis_url` is unset, AWS ElastiCache is provisioned and used by ECS tasks; Cloud Run will NOT be able to reach it.

Important Variables
- `environment`: `test` or `prod` (controls names and defaults)
- `images`: map of ECR image URIs per service. Jenkins fills this per build.
- `yt_hub_secret` (sensitive): Jenkins provides via credentials and `-var`.
- `use_sample_video`: true for `test` to enable SAMPLE_VIDEO_PATH (ingest)

Quick Start (manually)
```
cd infra/terraform
terraform init
terraform workspace new test || terraform workspace select test
terraform apply -var-file=environments/test.tfvars -var environment=test -var yt_hub_secret=CHANGE_ME
```

Outputs
- `alb_dns_name`: DNS to reach the webhook service over HTTP
- `redis_endpoint`: Hostname of Redis
- `ecr_repository_urls`: Map of ECR repos

Placeholders You Must Provide
- AWS credentials/permissions to create the above resources
- `yt_hub_secret` for each env (passed at apply time or via Jenkins)
- If enabling RDS later, set `enable_rds=true` and wire a real `database_url` secret

Notes
- HTTPS: add ACM cert + HTTPS listener to `aws_lb` if you have a domain.
- Scaling: tune `desired_count_*` and task CPU/mem vars to your workload.
- Costs: ElastiCache/EFS/NAT incur charges. Use small sizes in `test`.
