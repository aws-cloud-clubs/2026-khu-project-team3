###############################################################################
# Terraform 원격 State 백엔드 (S3 + DynamoDB Locking)
#
# 주의: backend 블록은 변수(${var.xxx})를 지원하지 않으므로 값을 하드코딩한다.
#       아래 bucket / dynamodb_table 이름은 infra/bootstrap 을 먼저 apply 하여
#       생성한 뒤, 그 출력값(state_bucket_name / lock_table_name)으로 교체한다.
#
#   초기화 순서:
#     1) cd infra/bootstrap && terraform init && terraform apply
#     2) 아래 bucket / dynamodb_table 값을 출력값으로 교체
#     3) cd infra && terraform init   (state 마이그레이션 프롬프트에 yes)
###############################################################################

terraform {
  backend "s3" {
    bucket         = "sajuhomerun-tfstate-changeme" # bootstrap 출력 state_bucket_name 으로 교체
    key            = "infra/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "sajuhomerun-tflock" # bootstrap 출력 lock_table_name 으로 교체
    encrypt        = true
  }
}
