###############################################################################
# 보안 그룹
#
# 트래픽 흐름:
#   인터넷 --(80)--> ALB --(8080)--> 백엔드 EC2 --(5432)--> RDS
#                                     Lambda    --(5432)--> RDS
#   백엔드 EC2 / Lambda --(아웃바운드)--> NAT 인스턴스 --> 인터넷
###############################################################################

# -----------------------------------------------------------------------------
# ALB SG : 인터넷에서 80 허용
# -----------------------------------------------------------------------------
resource "aws_security_group" "alb" {
  name        = "${local.prefix}-alb-sg"
  description = "ALB ingress HTTP 80"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix}-alb-sg"
  }
}

# -----------------------------------------------------------------------------
# 백엔드 EC2 SG : ALB 에서만 backend_port 허용
# -----------------------------------------------------------------------------
resource "aws_security_group" "backend" {
  name        = "${local.prefix}-backend-sg"
  description = "Backend EC2 ingress from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "App port from ALB"
    from_port       = var.backend_port
    to_port         = var.backend_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound via NAT"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix}-backend-sg"
  }
}

# -----------------------------------------------------------------------------
# NAT 인스턴스 SG : VPC 내부 트래픽 인입 허용, 전체 아웃바운드
# -----------------------------------------------------------------------------
resource "aws_security_group" "nat" {
  name        = "${local.prefix}-nat-sg"
  description = "NAT instance - allow VPC inbound, all outbound"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "All traffic from within VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "All outbound to internet"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix}-nat-sg"
  }
}

# -----------------------------------------------------------------------------
# Lambda SG : 아웃바운드 전용 (NAT 경유로 외부 통신)
# -----------------------------------------------------------------------------
resource "aws_security_group" "lambda" {
  name        = "${local.prefix}-lambda-sg"
  description = "Lambda egress only"
  vpc_id      = aws_vpc.main.id

  egress {
    description = "All outbound via NAT"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix}-lambda-sg"
  }
}

# -----------------------------------------------------------------------------
# RDS SG : 백엔드 EC2 와 Lambda 에서만 5432 허용
# -----------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${local.prefix}-rds-sg"
  description = "RDS ingress from backend EC2 and Lambda only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from backend EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  ingress {
    description     = "PostgreSQL from Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  tags = {
    Name = "${local.prefix}-rds-sg"
  }
}
