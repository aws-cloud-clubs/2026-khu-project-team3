###############################################################################
# Lambda 데이터 파이프라인
#
#   sh-lambda-game-crawler   (컨테이너/ECR)  --EventBridge--> SQS(main)
#   sh-lambda-fortune-crawler(ZIP)           --EventBridge--> SQS(main)
#   sh-lambda-llm-worker     (ZIP)           <--SQS 이벤트소스매핑-- SQS(main)
#
# 모든 함수는 Private-app 서브넷에 배치되어 NAT 인스턴스 경유로 외부(LLM/크롤링)
# 통신하며, RDS 접근이 가능하다.
###############################################################################

locals {
  # 모든 Lambda 공통 DB env (AWS_REGION 은 Lambda 런타임이 자동 주입하므로 설정 안 함)
  lambda_db_env = {
    DB_HOST       = aws_db_instance.postgres.address
    DB_PORT       = tostring(aws_db_instance.postgres.port)
    DB_NAME       = var.db_name
    DB_USER       = var.db_username
    DB_PASSWORD   = var.db_password
    SQS_QUEUE_URL = aws_sqs_queue.main.id
  }

  lambda_worker_env = merge(local.lambda_db_env, {
    DAILY_SAJU_PROMPT_VERSION = var.prompt_version
    UPSTAGE_API_KEY           = var.upstage_api_key
    UPSTAGE_MODEL             = var.upstage_model
  })
}

# =============================================================================
# 공통 IAM (assume role + 정책 문서)
# =============================================================================
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# SQS 발행 권한 (크롤러용)
data "aws_iam_policy_document" "lambda_sqs_send" {
  statement {
    effect    = "Allow"
    actions   = ["sqs:SendMessage", "sqs:GetQueueAttributes", "sqs:GetQueueUrl"]
    resources = [aws_sqs_queue.main.arn]
  }
}

# SQS 소비 권한 (worker용)
data "aws_iam_policy_document" "lambda_sqs_consume" {
  statement {
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]
    resources = [aws_sqs_queue.main.arn]
  }
}

# 각 Lambda 역할에 기본 로그 + VPC ENI 관리 권한 부여하는 헬퍼
# (AWSLambdaVPCAccessExecutionRole 에 logs + ec2 ENI 권한 포함)
locals {
  lambda_vpc_managed_policy = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"

  vpc_config = {
    subnet_ids         = aws_subnet.private_app[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# =============================================================================
# [함수 1] game-crawler (컨테이너 이미지 / ECR)
# =============================================================================
resource "aws_ecr_repository" "game_crawler" {
  name                 = "${local.prefix}-lambda-game-crawler"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true

  tags = {
    Name = "${local.prefix}-lambda-game-crawler"
  }
}

# 비용 절감: 최근 이미지 10개만 유지
resource "aws_ecr_lifecycle_policy" "game_crawler" {
  repository = aws_ecr_repository.game_crawler.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_iam_role" "game_crawler" {
  name               = "${local.prefix}-game-crawler-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "game_crawler_vpc" {
  role       = aws_iam_role.game_crawler.name
  policy_arn = local.lambda_vpc_managed_policy
}

resource "aws_iam_role_policy" "game_crawler_sqs" {
  name   = "sqs-send"
  role   = aws_iam_role.game_crawler.id
  policy = data.aws_iam_policy_document.lambda_sqs_send.json
}

resource "aws_cloudwatch_log_group" "game_crawler" {
  name              = "/aws/lambda/${local.prefix}-lambda-game-crawler"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "game_crawler" {
  function_name = "${local.prefix}-lambda-game-crawler"
  role          = aws_iam_role.game_crawler.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.game_crawler.repository_url}:${var.game_crawler_image_tag}"

  timeout       = 120
  memory_size   = 1024
  architectures = ["arm64"]

  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }

  environment {
    variables = local.lambda_db_env
  }

  logging_config {
    log_format = "JSON" # CloudWatch Logs Insights 구조화 분석용
    log_group  = aws_cloudwatch_log_group.game_crawler.name
  }

  # 최초 apply 시 ECR 이미지가 없으면 실패한다.
  # 부트스트랩: ECR 생성 -> docker push -> 본 함수 apply.
  # 이후 이미지 갱신은 CI(GitHub Actions) 가 담당하므로 tf 는 image_uri 변경을 무시.
  lifecycle {
    ignore_changes = [image_uri]
  }

  depends_on = [aws_iam_role_policy_attachment.game_crawler_vpc]
}

# =============================================================================
# [함수 2] fortune-crawler (ZIP)
# =============================================================================
resource "aws_iam_role" "fortune_crawler" {
  name               = "${local.prefix}-fortune-crawler-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "fortune_crawler_vpc" {
  role       = aws_iam_role.fortune_crawler.name
  policy_arn = local.lambda_vpc_managed_policy
}

resource "aws_iam_role_policy" "fortune_crawler_sqs" {
  name   = "sqs-send"
  role   = aws_iam_role.fortune_crawler.id
  policy = data.aws_iam_policy_document.lambda_sqs_send.json
}

resource "aws_cloudwatch_log_group" "fortune_crawler" {
  name              = "/aws/lambda/${local.prefix}-lambda-fortune-crawler"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "fortune_crawler" {
  function_name = "${local.prefix}-lambda-fortune-crawler"
  role          = aws_iam_role.fortune_crawler.arn
  package_type  = "Zip"
  runtime       = var.lambda_runtime
  handler       = var.fortune_crawler_handler
  architectures = ["x86_64"]

  filename         = var.fortune_crawler_zip_path
  source_code_hash = filebase64sha256(var.fortune_crawler_zip_path)

  timeout     = 120
  memory_size = 512

  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }

  environment {
    variables = local.lambda_db_env
  }

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.fortune_crawler.name
  }

  depends_on = [aws_iam_role_policy_attachment.fortune_crawler_vpc]
}

# =============================================================================
# [함수 3] llm-worker (ZIP) - SQS 이벤트 소스 매핑으로 트리거
# =============================================================================
resource "aws_iam_role" "worker" {
  name               = "${local.prefix}-llm-worker-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "worker_vpc" {
  role       = aws_iam_role.worker.name
  policy_arn = local.lambda_vpc_managed_policy
}

resource "aws_iam_role_policy" "worker_sqs" {
  name   = "sqs-consume"
  role   = aws_iam_role.worker.id
  policy = data.aws_iam_policy_document.lambda_sqs_consume.json
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/aws/lambda/${local.prefix}-lambda-llm-worker"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "worker" {
  function_name = "${local.prefix}-lambda-llm-worker"
  role          = aws_iam_role.worker.arn
  package_type  = "Zip"
  runtime       = var.lambda_runtime
  handler       = var.worker_handler
  architectures = ["x86_64"]

  filename         = var.worker_zip_path
  source_code_hash = filebase64sha256(var.worker_zip_path)

  timeout     = 120
  memory_size = 512

  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }

  environment {
    variables = local.lambda_worker_env
  }

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.worker.name
  }

  depends_on = [aws_iam_role_policy_attachment.worker_vpc]
}

# SQS -> worker 이벤트 소스 매핑 (부분 배치 실패 보고)
resource "aws_lambda_event_source_mapping" "worker_sqs" {
  event_source_arn                   = aws_sqs_queue.main.arn
  function_name                      = aws_lambda_function.worker.arn
  batch_size                         = 10
  maximum_batching_window_in_seconds = 5
  function_response_types            = ["ReportBatchItemFailures"]
}

# =============================================================================
# EventBridge Scheduler - 크롤러 정기 트리거
# =============================================================================
data "aws_iam_policy_document" "scheduler_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "scheduler" {
  name               = "${local.prefix}-scheduler-role"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume.json
}

data "aws_iam_policy_document" "scheduler_invoke" {
  statement {
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      aws_lambda_function.game_crawler.arn,
      aws_lambda_function.fortune_crawler.arn,
    ]
  }
}

resource "aws_iam_role_policy" "scheduler_invoke" {
  name   = "invoke-lambda"
  role   = aws_iam_role.scheduler.id
  policy = data.aws_iam_policy_document.scheduler_invoke.json
}

resource "aws_scheduler_schedule" "game_crawler" {
  name = "${local.prefix}-sched-game-crawler"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = var.game_crawler_schedule
  schedule_expression_timezone = "UTC"

  target {
    arn      = aws_lambda_function.game_crawler.arn
    role_arn = aws_iam_role.scheduler.arn
  }
}

resource "aws_scheduler_schedule" "fortune_crawler" {
  name = "${local.prefix}-sched-fortune-crawler"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = var.fortune_crawler_schedule
  schedule_expression_timezone = "UTC"

  target {
    arn      = aws_lambda_function.fortune_crawler.arn
    role_arn = aws_iam_role.scheduler.arn
  }
}
