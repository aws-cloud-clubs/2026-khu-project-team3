variable "region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "state_bucket_name" {
  description = "Terraform state 저장용 S3 버킷명 (전역 유일해야 함). 예: sajuhomerun-tfstate-<계정ID 또는 임의 suffix>"
  type        = string
  default     = "sajuhomerun-tfstate-changeme"
}

variable "lock_table_name" {
  description = "State Locking 용 DynamoDB 테이블명"
  type        = string
  default     = "sajuhomerun-tflock"
}
