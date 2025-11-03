locals {
  use_elasticache = var.external_redis_url == null || var.external_redis_url == ""
}

resource "aws_elasticache_subnet_group" "redis" {
  count      = local.use_elasticache ? 1 : 0
  name       = "${var.project_name}-${var.environment}-redis"
  subnet_ids = [for s in aws_subnet.private : s.id]
}

resource "aws_elasticache_cluster" "redis" {
  count                = local.use_elasticache ? 1 : 0
  cluster_id           = "${var.project_name}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis[0].name
  port                 = 6379
  security_group_ids   = [aws_security_group.redis.id]
}

output "redis_endpoint" {
  value       = local.use_elasticache ? aws_elasticache_cluster.redis[0].cache_nodes[0].address : null
  description = "Redis endpoint when using ElastiCache"
}
