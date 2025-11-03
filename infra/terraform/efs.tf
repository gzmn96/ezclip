resource "aws_efs_file_system" "shared" {
  creation_token = "${var.project_name}-${var.environment}-fs"
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }
  throughput_mode = "bursting"
}

resource "aws_efs_mount_target" "mt" {
  for_each       = { for idx, sn in aws_subnet.private : idx => sn }
  file_system_id = aws_efs_file_system.shared.id
  subnet_id      = each.value.id
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_access_point" "ap" {
  file_system_id = aws_efs_file_system.shared.id
  posix_user {
    gid = 1000
    uid = 1000
  }
  root_directory {
    path = "/app-tmp"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "0777"
    }
  }
}

output "efs_file_system_id" {
  value = aws_efs_file_system.shared.id
}

