###############################################################################
# Terraform Remote State Bootstrap
#
# 루트 모듈(../)의 S3 원격 백엔드가 사용할 S3 버킷과 DynamoDB 락 테이블을 생성한다.
# 백엔드는 `terraform init` 시점에 이미 존재해야 하므로 이 구성은 별도 로컬 state로
# 먼저 1회 apply 한 뒤, 출력된 이름을 ../backend.tf 에 기입한다.
#
#   1) cd infra/bootstrap
#   2) terraform init
#   3) terraform apply -var="state_bucket_name=<전역-유일-버킷명>"
#   4) 출력 값을 ../backend.tf 에 반영 후, cd .. && terraform init
###############################################################################

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "SajuHomerun"
      Environment = "Dev"
      ManagedBy   = "Terraform"
      Component   = "tf-state-bootstrap"
    }
  }
}

# -----------------------------------------------------------------------------
# Terraform state 저장용 S3 버킷
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name

  # state 파일이 들어있는 버킷이므로 실수로 destroy 되지 않도록 보호
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------------------------
# State Locking 용 DynamoDB 테이블 (LockID 해시키 고정)
# -----------------------------------------------------------------------------
resource "aws_dynamodb_table" "lock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
