###############################################################################
# SSM Parameter Store (SecureString) - 시크릿 보관 (비용 $0)
#
# EC2/Lambda IAM 정책은 /${prefix}/* 경로 읽기를 허용한다.
# 값은 terraform.tfvars 또는 TF_VAR_* 환경변수로 주입한다.
###############################################################################

resource "aws_ssm_parameter" "db_password" {
  name        = "/${local.prefix}/db_password"
  description = "PostgreSQL 마스터 비밀번호"
  type        = "SecureString"
  value       = var.db_password

  tags = {
    Name = "${local.prefix}-db-password"
  }
}

resource "aws_ssm_parameter" "upstage_api_key" {
  name        = "/${local.prefix}/upstage_api_key"
  description = "Upstage(OpenAI 호환) API 키"
  type        = "SecureString"
  # 비어 있으면 placeholder 저장 (이후 콘솔/CLI 로 교체 가능). 빈 문자열은 불가하므로 처리.
  value = var.upstage_api_key != "" ? var.upstage_api_key : "PLACEHOLDER_REPLACE_ME"

  # 콘솔/CLI 로 실제 키를 갱신한 경우 terraform 이 덮어쓰지 않도록
  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Name = "${local.prefix}-upstage-api-key"
  }
}
