###############################################################################
# SQS 메시지 큐 + DLQ
# - sh-msg-queue : 크롤러 -> worker 파이프라인 메인 큐
# - sh-dlq       : 3회 이상 처리 실패 메시지 격리
###############################################################################

resource "aws_sqs_queue" "dlq" {
  name                      = "${local.prefix}-dlq"
  message_retention_seconds = 1209600 # 14일

  tags = {
    Name = "${local.prefix}-dlq"
  }
}

resource "aws_sqs_queue" "main" {
  name                       = "${local.prefix}-msg-queue"
  visibility_timeout_seconds = 180 # worker Lambda 타임아웃보다 크게
  message_retention_seconds  = 345600

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name = "${local.prefix}-msg-queue"
  }
}

# DLQ 가 위 메인 큐로부터의 redrive 만 허용하도록 정책 명시 (선택적 강화)
resource "aws_sqs_queue_redrive_allow_policy" "dlq" {
  queue_url = aws_sqs_queue.dlq.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [aws_sqs_queue.main.arn]
  })
}
