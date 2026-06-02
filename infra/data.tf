###############################################################################
# 데이터 소스 (AMI, 계정/리전 정보)
###############################################################################

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# 최신 Amazon Linux 2023 AMI (arm64) - NAT 인스턴스 + 백엔드 EC2(둘 다 t4g)용
data "aws_ssm_parameter" "al2023_arm64" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  prefix     = var.name_prefix
}
