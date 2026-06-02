output "state_bucket_name" {
  description = "../backend.tf 의 bucket 에 기입할 S3 버킷명"
  value       = aws_s3_bucket.state.id
}

output "lock_table_name" {
  description = "../backend.tf 의 dynamodb_table 에 기입할 DynamoDB 테이블명"
  value       = aws_dynamodb_table.lock.name
}
