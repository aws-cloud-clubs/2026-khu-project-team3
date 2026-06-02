###############################################################################
# 모니터링 / 알람 (비용 $0 옵저버빌리티 골격)
#
# - SNS 토픽으로 알람 집중. 이메일 구독(선택) 또는 Slack 연동(아래 주석 참고).
# - CloudWatch Alarm: ALB 5xx, worker Lambda Errors, DLQ 적체.
###############################################################################

resource "aws_sns_topic" "alerts" {
  name = "${local.prefix}-alerts"

  tags = {
    Name = "${local.prefix}-alerts"
  }
}

# (선택) 이메일 구독 - alarm_email 변수 지정 시 생성. 확인 메일 승인 필요.
resource "aws_sns_topic_subscription" "email" {
  count     = var.alarm_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# ---------------------------------------------------------------------------
# Slack 연동 골격 (택1, 별도 설정 필요)
#
#  방법 A) AWS Chatbot
#    - AWS Chatbot 콘솔에서 Slack workspace 인증 후, 위 aws_sns_topic.alerts 를
#      대상 토픽으로 지정하면 알람이 Slack 채널로 전달됨.
#
#  방법 B) Lambda + Slack Incoming Webhook
#    - SNS 구독(protocol="lambda")으로 SNS -> Lambda 연결,
#      Lambda 가 Slack Webhook URL 로 POST. (Webhook URL 은 SSM SecureString 보관)
#    예시 골격:
#    # resource "aws_sns_topic_subscription" "slack" {
#    #   topic_arn = aws_sns_topic.alerts.arn
#    #   protocol  = "lambda"
#    #   endpoint  = aws_lambda_function.slack_notifier.arn
#    # }
# ---------------------------------------------------------------------------

# ALB 5xx 급증
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${local.prefix}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.backend.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# worker Lambda 오류
resource "aws_cloudwatch_metric_alarm" "worker_errors" {
  alarm_name          = "${local.prefix}-worker-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.worker.function_name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# DLQ 적체 (처리 실패 메시지 발생)
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "${local.prefix}-dlq-not-empty"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = aws_sqs_queue.dlq.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}
