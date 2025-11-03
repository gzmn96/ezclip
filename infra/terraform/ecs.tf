resource "aws_cloudwatch_log_group" "this" {
  name              = "/${var.project_name}/${var.environment}"
  retention_in_days = 7
}

resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-${var.environment}"
}

locals {
  efs_volume_name = "shared-tmp"
}

data "aws_ecr_repository" "webhook" { name = aws_ecr_repository.repos["webhook"].name }
data "aws_ecr_repository" "ingest"  { name = aws_ecr_repository.repos["ingest"].name }
data "aws_ecr_repository" "analyze" { name = aws_ecr_repository.repos["analyze"].name }
data "aws_ecr_repository" "clipper" { name = aws_ecr_repository.repos["clipper"].name }
data "aws_ecr_repository" "publish" { name = aws_ecr_repository.repos["publish"].name }

# Task definitions
resource "aws_ecs_task_definition" "webhook" {
  count                    = var.deploy_webhook_on_aws ? 1 : 0
  family                   = "${var.project_name}-${var.environment}-webhook"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.container_cpu)
  memory                   = tostring(var.container_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  volume {
    name = local.efs_volume_name
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.shared.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.ap.id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "webhook"
      image     = var.images.webhook
      essential = true
      portMappings = [{ containerPort = 3000, hostPort = 3000, protocol = "tcp" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "webhook"
        }
      }
      mountPoints = [{ sourceVolume = local.efs_volume_name, containerPath = "/app/tmp", readOnly = false }]
      environment = [
        { name = "TMP_DIR", value = "/app/tmp" }
      ]
      secrets = [
        { name = "REDIS_URL", valueFrom = aws_ssm_parameter.redis_url.arn },
        { name = "YT_HUB_SECRET", valueFrom = aws_ssm_parameter.yt_hub_secret.arn }
      ]
    }
  ])
}

resource "aws_ecs_task_definition" "ingest" {
  count                    = var.deploy_ingest_on_aws ? 1 : 0
  family                   = "${var.project_name}-${var.environment}-ingest"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.container_cpu)
  memory                   = tostring(var.container_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  volume {
    name = local.efs_volume_name
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.shared.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.ap.id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "ingest"
      image     = var.images.ingest
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ingest"
        }
      }
      mountPoints = [{ sourceVolume = local.efs_volume_name, containerPath = "/app/tmp", readOnly = false }]
      environment = concat([
        { name = "TMP_DIR", value = "/app/tmp" }
      ], var.use_sample_video ? [ { name = "SAMPLE_VIDEO_PATH", value = "/app/sample.mp4" } ] : [])
      secrets = [ { name = "REDIS_URL", valueFrom = aws_ssm_parameter.redis_url.arn } ]
    }
  ])
}

resource "aws_ecs_task_definition" "analyze" {
  count                    = var.deploy_analyze_on_aws ? 1 : 0
  family                   = "${var.project_name}-${var.environment}-analyze"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.container_cpu)
  memory                   = tostring(var.container_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  volume {
    name = local.efs_volume_name
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.shared.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.ap.id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "analyze"
      image     = var.images.analyze
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "analyze"
        }
      }
      mountPoints = [{ sourceVolume = local.efs_volume_name, containerPath = "/app/tmp", readOnly = false }]
      environment = [ { name = "TMP_DIR", value = "/app/tmp" } ]
      secrets     = [ { name = "REDIS_URL", valueFrom = aws_ssm_parameter.redis_url.arn } ]
    }
  ])
}

resource "aws_ecs_task_definition" "clipper" {
  count                    = var.deploy_clipper_on_aws ? 1 : 0
  family                   = "${var.project_name}-${var.environment}-clipper"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.container_cpu)
  memory                   = tostring(var.container_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  volume {
    name = local.efs_volume_name
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.shared.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.ap.id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "clipper"
      image     = var.images.clipper
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "clipper"
        }
      }
      mountPoints = [{ sourceVolume = local.efs_volume_name, containerPath = "/app/tmp", readOnly = false }]
      environment = [ { name = "TMP_DIR", value = "/app/tmp" } ]
      secrets     = [ { name = "REDIS_URL", valueFrom = aws_ssm_parameter.redis_url.arn } ]
    }
  ])
}

resource "aws_ecs_task_definition" "publish" {
  count                    = var.deploy_publish_on_aws ? 1 : 0
  family                   = "${var.project_name}-${var.environment}-publish"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.container_cpu)
  memory                   = tostring(var.container_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  container_definitions = jsonencode([
    {
      name      = "publish"
      image     = var.images.publish
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "publish"
        }
      }
      secrets = [ { name = "REDIS_URL", valueFrom = aws_ssm_parameter.redis_url.arn } ]
    }
  ])
}

# ALB for webhook
resource "aws_lb" "web" {
  count              = var.deploy_webhook_on_aws ? 1 : 0
  name               = "${var.project_name}-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [for s in aws_subnet.public : s.id]
}

resource "aws_lb_target_group" "webhook" {
  count       = var.deploy_webhook_on_aws ? 1 : 0
  name        = "${var.project_name}-${var.environment}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.this.id
  target_type = "ip"
  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 5
    interval            = 15
    timeout             = 5
    matcher             = "200"
  }
}

resource "aws_lb_listener" "http" {
  count             = var.deploy_webhook_on_aws ? 1 : 0
  load_balancer_arn = aws_lb.web[0].arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.webhook[0].arn
  }
}

# Services
resource "aws_ecs_service" "webhook" {
  count           = var.deploy_webhook_on_aws ? 1 : 0
  name            = "${var.project_name}-${var.environment}-webhook"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "FARGATE"
  desired_count   = var.desired_count_webhook
  task_definition = aws_ecs_task_definition.webhook[0].arn

  network_configuration {
    subnets         = [for s in aws_subnet.private : s.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.webhook[0].arn
    container_name   = "webhook"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "ingest" {
  count           = var.deploy_ingest_on_aws ? 1 : 0
  name            = "${var.project_name}-${var.environment}-ingest"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "FARGATE"
  desired_count   = var.desired_count_workers
  task_definition = aws_ecs_task_definition.ingest[0].arn

  network_configuration {
    subnets         = [for s in aws_subnet.private : s.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_service" "analyze" {
  count           = var.deploy_analyze_on_aws ? 1 : 0
  name            = "${var.project_name}-${var.environment}-analyze"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "FARGATE"
  desired_count   = var.desired_count_workers
  task_definition = aws_ecs_task_definition.analyze[0].arn

  network_configuration {
    subnets         = [for s in aws_subnet.private : s.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_service" "clipper" {
  count           = var.deploy_clipper_on_aws ? 1 : 0
  name            = "${var.project_name}-${var.environment}-clipper"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "FARGATE"
  desired_count   = var.desired_count_workers
  task_definition = aws_ecs_task_definition.clipper[0].arn

  network_configuration {
    subnets         = [for s in aws_subnet.private : s.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_service" "publish" {
  count           = var.deploy_publish_on_aws ? 1 : 0
  name            = "${var.project_name}-${var.environment}-publish"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "FARGATE"
  desired_count   = var.desired_count_workers
  task_definition = aws_ecs_task_definition.publish[0].arn

  network_configuration {
    subnets         = [for s in aws_subnet.private : s.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

output "alb_dns_name" { value = var.deploy_webhook_on_aws ? aws_lb.web[0].dns_name : null }
