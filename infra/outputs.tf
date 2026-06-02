###############################################################################
# 출력 (claude.md 5-2 규칙: ALB DNS, RDS Endpoint 필수)
###############################################################################

output "alb_dns_name" {
  description = "ALB DNS 이름 (서비스 진입점)"
  value       = aws_lb.backend.dns_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL 엔드포인트 (host:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "RDS PostgreSQL 호스트"
  value       = aws_db_instance.postgres.address
}

output "ecr_repository_url" {
  description = "game-crawler Lambda 컨테이너 이미지 푸시 대상 ECR URL"
  value       = aws_ecr_repository.game_crawler.repository_url
}

output "sqs_queue_url" {
  description = "메인 SQS 큐 URL (Lambda SQS_QUEUE_URL 환경변수 값)"
  value       = aws_sqs_queue.main.id
}

output "dlq_url" {
  description = "DLQ URL"
  value       = aws_sqs_queue.dlq.id
}

output "nat_instance_public_ip" {
  description = "NAT 인스턴스 EIP (아웃바운드 고정 IP)"
  value       = aws_eip.nat.public_ip
}

output "backend_instance_id" {
  description = "백엔드 EC2 인스턴스 ID (SSM Session Manager 접속용)"
  value       = aws_instance.backend.id
}

output "vpc_id" {
  description = "생성된 VPC ID"
  value       = aws_vpc.main.id
}
