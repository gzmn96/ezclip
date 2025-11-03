resource "aws_ssm_parameter" "yt_hub_secret" {
  name  = "/${var.project_name}/${var.environment}/YT_HUB_SECRET"
  type  = "SecureString"
  value = var.yt_hub_secret
}

resource "aws_ssm_parameter" "tmp_dir" {
  name  = "/${var.project_name}/${var.environment}/TMP_DIR"
  type  = "String"
  value = "/app/tmp"
}

resource "aws_ssm_parameter" "redis_url" {
  name  = "/${var.project_name}/${var.environment}/REDIS_URL"
  type  = "String"
  value = var.external_redis_url != null && var.external_redis_url != "" ? var.external_redis_url : (length(aws_elasticache_cluster.redis) > 0 ? "redis://${aws_elasticache_cluster.redis[0].cache_nodes[0].address}:6379" : "")
}


resource "aws_ssm_parameter" "database_url" {
  count = var.enable_rds ? 1 : 0
  name  = "/${var.project_name}/${var.environment}/DATABASE_URL"
  type  = "SecureString"
  value = "postgres://placeholder"
}

resource "aws_ssm_parameter" "sample_video_path" {
  count = var.use_sample_video ? 1 : 0
  name  = "/${var.project_name}/${var.environment}/SAMPLE_VIDEO_PATH"
  type  = "String"
  value = "/app/sample.mp4"
}
