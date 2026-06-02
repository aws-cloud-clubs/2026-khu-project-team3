###############################################################################
# RDS PostgreSQL (격리 Private Subnet, Single-AZ, 최저 스펙)
###############################################################################

resource "aws_db_subnet_group" "main" {
  name       = "${local.prefix}-db-subnet-group"
  subnet_ids = aws_subnet.db[*].id

  tags = {
    Name = "${local.prefix}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "${local.prefix}-postgres"
  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = false # Single-AZ (비용 절감)
  publicly_accessible = false # 외부 직접 노출 금지

  # 운영 비용/편의 절충 (개발 환경)
  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false
  apply_immediately       = true

  # CloudWatch Logs 로 PostgreSQL 로그 스트리밍
  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "${local.prefix}-postgres"
  }
}
