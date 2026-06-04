###############################################################################
# 공통 / 태그
###############################################################################

variable "region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "project" {
  description = "프로젝트 태그 값"
  type        = string
  default     = "SajuHomerun"
}

variable "environment" {
  description = "환경 태그 값"
  type        = string
  default     = "Dev"
}

variable "name_prefix" {
  description = "리소스 이름 접두사"
  type        = string
  default     = "sh"
}

###############################################################################
# 네트워크 (VPC)
###############################################################################

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "사용할 가용영역 2개 (ALB/RDS 서브넷 그룹 요건상 최소 2개)"
  type        = list(string)
  default     = ["ap-northeast-2a", "ap-northeast-2c"]
}

variable "public_subnet_cidrs" {
  description = "퍼블릭 서브넷 CIDR (ALB, NAT 인스턴스)"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "프라이빗 앱 서브넷 CIDR (백엔드 EC2, Lambda) - NAT 경유 아웃바운드"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "db_subnet_cidrs" {
  description = "격리(Isolated) DB 서브넷 CIDR - 인터넷 경로 없음"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

###############################################################################
# 인스턴스 타입
###############################################################################

variable "nat_instance_type" {
  description = "NAT 인스턴스 타입 (arm64 Graviton)"
  type        = string
  default     = "t4g.micro"
}

variable "backend_instance_type" {
  description = "백엔드 EC2(Spring Boot) 인스턴스 타입 (arm64 Graviton). Docker 이미지를 linux/arm64 로 빌드해야 함"
  type        = string
  default     = "t4g.micro"
}

variable "db_instance_class" {
  description = "RDS 인스턴스 클래스"
  type        = string
  default     = "db.t4g.micro"
}

###############################################################################
# 백엔드 / ALB
###############################################################################

variable "backend_port" {
  description = "Spring Boot 컨테이너 포트"
  type        = number
  default     = 8080
}

variable "health_check_path" {
  description = "ALB Target Group 헬스체크 경로"
  type        = string
  default     = "/"
}

variable "backend_image_uri" {
  description = "백엔드 EC2 가 실행할 Spring Boot Docker 이미지 URI. 예: <account>.dkr.ecr.ap-northeast-2.amazonaws.com/sh-backend-api:latest. 비우면 user_data 에서 실행 생략"
  type        = string
  default     = ""
}

variable "asg_min_size" {
  description = "백엔드 ASG 최소 인스턴스 수"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "백엔드 ASG 최대 인스턴스 수"
  type        = number
  default     = 2
}

variable "asg_desired_capacity" {
  description = "백엔드 ASG 희망 인스턴스 수"
  type        = number
  default     = 1
}

variable "asg_cpu_target" {
  description = "CPU 기반 Auto Scaling 목표치 (%)"
  type        = number
  default     = 60
}

###############################################################################
# 데이터베이스
###############################################################################

variable "db_name" {
  description = "PostgreSQL 데이터베이스 이름"
  type        = string
  default     = "sajuhomerun"
}

variable "db_username" {
  description = "PostgreSQL 마스터 사용자명"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "PostgreSQL 마스터 비밀번호 (SSM SecureString 으로 저장됨). terraform.tfvars 또는 TF_VAR_db_password 로 주입"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "RDS 스토리지(GB)"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "PostgreSQL 엔진 버전"
  type        = string
  default     = "16.13"
}

###############################################################################
# LLM / 애플리케이션 시크릿
###############################################################################

variable "upstage_api_key" {
  description = "Upstage(OpenAI 호환) API 키 (SSM SecureString 으로 저장)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "upstage_model" {
  description = "Upstage 모델명"
  type        = string
  default     = ""
}

variable "prompt_version" {
  description = "DAILY_SAJU_PROMPT_VERSION 값"
  type        = string
  default     = "v1"
}

###############################################################################
# Lambda
###############################################################################

variable "game_crawler_image_tag" {
  description = "game-crawler ECR 이미지 태그"
  type        = string
  default     = "latest"
}

variable "fortune_crawler_zip_path" {
  description = "fortune-crawler(ohaasa) Lambda ZIP 경로"
  type        = string
  default     = "../backend-batch/ohaasa-aggregator/dist/ohaasa-aggregator-handler.zip"
}

variable "fortune_crawler_handler" {
  description = "fortune-crawler Lambda 핸들러"
  type        = string
  default     = "ohaasa_aggregator.handlers.aggregator_handler.handler"
}

variable "worker_zip_path" {
  description = "worker Lambda ZIP 경로"
  type        = string
  default     = "../backend-batch/worker/dist/worker-handler.zip"
}

variable "worker_handler" {
  description = "worker Lambda 핸들러"
  type        = string
  default     = "worker.handlers.worker_handler.handler"
}

variable "lambda_runtime" {
  description = "ZIP 기반 Lambda 런타임"
  type        = string
  default     = "python3.12"
}

variable "game_crawler_schedule" {
  description = "game-crawler EventBridge Scheduler cron (Asia/Seoul). 기본: 월요일 제외 매일 06:00 KST"
  type        = string
  default     = "cron(0 6 ? * TUE,WED,THU,FRI,SAT,SUN *)"
}

variable "fortune_crawler_schedule" {
  description = "fortune-crawler EventBridge Scheduler cron (Asia/Seoul). 기본: 매일 12:00 KST"
  type        = string
  default     = "cron(0 12 * * ? *)"
}

###############################################################################
# 모니터링
###############################################################################

variable "alarm_email" {
  description = "CloudWatch 알람 SNS 구독 이메일 (비우면 구독 미생성). Slack 연동은 monitoring.tf 주석 참고"
  type        = string
  default     = ""
}

variable "log_retention_days" {
  description = "CloudWatch Logs 보존 기간(일)"
  type        = number
  default     = 14
}
