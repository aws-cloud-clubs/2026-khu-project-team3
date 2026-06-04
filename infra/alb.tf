###############################################################################
# Application Load Balancer (Public Subnet)
# - HTTP 80 단일 리스너 (비용 최소화, ACM/도메인 없음)
# - Target Group: 백엔드 EC2 (instance 타깃, backend_port)
###############################################################################

resource "aws_lb" "backend" {
  name               = "${local.prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${local.prefix}-alb"
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "${local.prefix}-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/api/v1/saju/games/today"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${local.prefix}-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# 타깃 그룹 등록은 aws_autoscaling_group.backend의 target_group_arns 에서 처리
