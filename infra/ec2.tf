###############################################################################
# 백엔드 EC2 (Spring Boot 도커 컨테이너) - 스팟 인스턴스
#
# - Private-app 서브넷 배치 (ALB 뒤), 아웃바운드는 NAT 인스턴스 경유
# - 스팟 인스턴스로 비용 절감
# - 직접 SSH 대신 SSM Session Manager 사용
# - user_data 로 Docker 설치 + (이미지 지정 시) 컨테이너 기동
# - DB 비밀번호/LLM 키는 SSM Parameter Store 에서 런타임 조회
###############################################################################

# -----------------------------------------------------------------------------
# IAM (인스턴스 프로파일)
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backend" {
  name               = "${local.prefix}-backend-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

# SSM Session Manager 접속
resource "aws_iam_role_policy_attachment" "backend_ssm" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# ECR pull (Spring Boot 이미지)
resource "aws_iam_role_policy_attachment" "backend_ecr" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# CloudWatch Logs 쓰기 + SSM 파라미터(시크릿) 읽기
data "aws_iam_policy_document" "backend_inline" {
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
    ]
    resources = ["${aws_cloudwatch_log_group.backend.arn}:*"]
  }

  statement {
    sid     = "ReadAppSecrets"
    effect  = "Allow"
    actions = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
    resources = [
      "arn:aws:ssm:${local.region}:${local.account_id}:parameter/${local.prefix}/*",
    ]
  }
}

resource "aws_iam_role_policy" "backend_inline" {
  name   = "${local.prefix}-backend-inline"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.backend_inline.json
}

resource "aws_iam_instance_profile" "backend" {
  name = "${local.prefix}-backend-profile"
  role = aws_iam_role.backend.name
}

# -----------------------------------------------------------------------------
# ECR 레포지토리 (Spring Boot 이미지)
# -----------------------------------------------------------------------------
resource "aws_ecr_repository" "backend" {
  name                 = "${local.prefix}-backend-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true

  tags = {
    Name = "${local.prefix}-backend-api-ecr"
  }
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# -----------------------------------------------------------------------------
# CloudWatch Logs 그룹 (JSON 구조화 로그)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/${var.project}/backend-api"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${local.prefix}-backend-logs"
  }
}

# -----------------------------------------------------------------------------
# user_data : Docker 설치 + 컨테이너 기동 골격
# -----------------------------------------------------------------------------
locals {
  backend_user_data = <<-EOF
    #!/bin/bash
    set -euxo pipefail

    dnf update -y
    dnf install -y docker awscli
    systemctl enable --now docker

    # SSM 에서 시크릿 조회
    DB_PASSWORD=$(aws ssm get-parameter --with-decryption --region ${local.region} \
      --name "/${local.prefix}/db_password" --query 'Parameter.Value' --output text)
    UPSTAGE_API_KEY=$(aws ssm get-parameter --with-decryption --region ${local.region} \
      --name "/${local.prefix}/upstage_api_key" --query 'Parameter.Value' --output text || echo "")

    IMAGE_URI="${var.backend_image_uri}"
    if [ -n "$IMAGE_URI" ]; then
      # ECR 로그인 (이미지가 ECR 인 경우)
      aws ecr get-login-password --region ${local.region} \
        | docker login --username AWS --password-stdin "$(echo "$IMAGE_URI" | cut -d'/' -f1)" || true

      docker run -d --restart always --name backend-api \
        -p ${var.backend_port}:${var.backend_port} \
        --log-driver=awslogs \
        --log-opt awslogs-region=${local.region} \
        --log-opt awslogs-group=${aws_cloudwatch_log_group.backend.name} \
        -e SPRING_DATASOURCE_URL="jdbc:postgresql://${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${var.db_name}" \
        -e SPRING_DATASOURCE_USERNAME="${var.db_username}" \
        -e SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD" \
        -e UPSTAGE_API_KEY="$UPSTAGE_API_KEY" \
        "$IMAGE_URI"
    else
      echo "backend_image_uri 미지정 - 컨테이너 기동 생략 (이미지 준비 후 변수 설정)"
    fi
  EOF
}

# -----------------------------------------------------------------------------
# Launch Template (스팟 인스턴스 설정)
# -----------------------------------------------------------------------------
resource "aws_launch_template" "backend" {
  name_prefix   = "${local.prefix}-backend-"
  image_id      = data.aws_ssm_parameter.al2023_arm64.value
  instance_type = var.backend_instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.backend.name
  }

  vpc_security_group_ids = [aws_security_group.backend.id]

  user_data = base64encode(local.backend_user_data)

  metadata_options {
    http_tokens = "required" # IMDSv2 강제
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${local.prefix}-backend-api"
      Project     = var.project
      Environment = var.environment
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# Auto Scaling Group (min=1, max=2, 전량 스팟)
# -----------------------------------------------------------------------------
resource "aws_autoscaling_group" "backend" {
  name                      = "${local.prefix}-backend-asg"
  vpc_zone_identifier       = aws_subnet.private_app[*].id
  target_group_arns         = [aws_lb_target_group.backend.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 120

  min_size         = var.asg_min_size
  max_size         = var.asg_max_size
  desired_capacity = var.asg_min_size

  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 0
      on_demand_percentage_above_base_capacity = 0
      spot_allocation_strategy                 = "lowest-price"
    }

    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.backend.id
        version            = "$Latest"
      }
    }
  }

  tag {
    key                 = "Name"
    value               = "${local.prefix}-backend-api"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = var.project
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# CPU 타깃 트래킹 스케일링 정책 (70% 기준)
# -----------------------------------------------------------------------------
resource "aws_autoscaling_policy" "backend_cpu" {
  name                   = "${local.prefix}-backend-cpu-tracking"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
