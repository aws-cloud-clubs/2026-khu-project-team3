# 사주홈런 인프라 (Terraform)

서울 리전(`ap-northeast-2`) 기준, 월 ~$50 이하를 목표로 한 비용 최적화 AWS 인프라 코드.

## 아키텍처 개요

```
인터넷 ──80──▶ ALB(public) ──8080──▶ 백엔드 EC2(스팟, private-app) ──5432──▶ RDS PostgreSQL(격리 subnet)
                                          │
              EventBridge Scheduler ─▶ game-crawler(ECR)  ─┐
                                       fortune-crawler(ZIP)─┼─▶ SQS(sh-msg-queue) ─▶ llm-worker(ZIP) ─▶ RDS
                                                            │            │
   private-app/Lambda 아웃바운드 ─▶ NAT 인스턴스(t4g.micro, public) ─▶ 인터넷    └─(3회 실패)─▶ DLQ(sh-dlq)
```

- **NAT 인스턴스**: Managed NAT Gateway 대신 `t4g.micro` EC2 (`source_dest_check=false`, iptables MASQUERADE) 로 비용 방어
- **백엔드 EC2**: 스팟 인스턴스, ALB 뒤 private-app 서브넷, SSM Session Manager 로 접속
- **RDS**: `db.t4g.micro` Single-AZ, 격리 서브넷, 외부 비노출. EC2/Lambda SG 에서만 5432 허용
- **Lambda**: game-crawler=컨테이너(ECR), fortune-crawler/worker=ZIP. 전부 private-app 서브넷에서 NAT 경유 외부통신
- **시크릿**: SSM Parameter Store SecureString (`/sh/db_password`, `/sh/upstage_api_key`)
- **로그/알람**: 전 리소스 CloudWatch Logs(JSON 포맷) + SNS(`sh-alerts`) 기반 알람 골격

## 파일 구성

| 파일 | 내용 |
|------|------|
| `bootstrap/` | 원격 state용 S3 버킷 + DynamoDB 락 테이블 (최초 1회 별도 apply) |
| `providers.tf` / `backend.tf` | provider, 공통 태그, S3 원격 백엔드 |
| `variables.tf` / `data.tf` | 변수, AMI/계정 데이터소스, locals |
| `vpc.tf` / `nat.tf` | VPC·서브넷·라우팅, NAT 인스턴스 |
| `security_groups.tf` | ALB/backend/NAT/Lambda/RDS SG |
| `alb.tf` / `ec2.tf` | ALB·타깃그룹, 백엔드 스팟 EC2·IAM·로그 |
| `rds.tf` / `sqs.tf` / `ssm.tf` | RDS, SQS+DLQ, 시크릿 파라미터 |
| `lambda.tf` | ECR, 3개 Lambda, IAM, SQS 매핑, EventBridge Scheduler |
| `monitoring.tf` / `outputs.tf` | SNS·CloudWatch 알람, 출력값 |

## 사용 방법

### 0) 사전 준비
- AWS 자격증명 구성(`aws configure` 또는 환경변수)
- `terraform.tfvars.example` → `terraform.tfvars` 복사 후 `db_password` 등 채움
- Lambda ZIP 빌드: `backend-batch/*/scripts/build_lambda_zip.sh` 실행 (dist/*.zip 생성)

### 1) 원격 state 백엔드 부트스트랩
```bash
cd infra/bootstrap
terraform init
terraform apply -var="state_bucket_name=sajuhomerun-tfstate-<유일suffix>"
```
출력된 `state_bucket_name` / `lock_table_name` 을 `infra/backend.tf` 에 기입.

### 2) 메인 인프라
```bash
cd infra
terraform init           # state 마이그레이션 yes
terraform plan
terraform apply
```

### 3) 컨테이너 이미지 (game-crawler)
`terraform apply` 로 ECR 리포지토리 생성 후 이미지 푸시:
```bash
# outputs 의 ecr_repository_url 사용
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <repo>
docker build -f backend-batch/game-aggregator/Dockerfile -t <repo>:latest backend-batch
docker push <repo>:latest
```
> game-crawler Lambda 는 `image_uri` 변경을 무시(`ignore_changes`)하므로 최초 1회는 이미지 푸시 후 다시 apply 가 필요할 수 있다.

## 출력값
`alb_dns_name`(서비스 진입), `rds_endpoint`, `ecr_repository_url`, `sqs_queue_url`, `nat_instance_public_ip`, `backend_instance_id` 등.

## 비용 개략 (월, 서울)
ALB ~$18 + RDS+스토리지 ~$16 + NAT t4g.micro ~$3 + 백엔드 EC2 스팟 ~$3 + Lambda/SQS/SSM ~$0 ≈ **~$40** (목표 $50 이하 충족). ALB 가 최대 고정비.

## 메모 / 가정
- Spring Boot 포트 `8080` 가정(`backend_port` 변수). 실제와 다르면 변경.
- 백엔드 EC2 는 x86(`t3.micro`) 기본. Docker 이미지가 arm64 면 `backend_instance_type=t4g.micro`.
- `UPSTAGE_API_KEY` SSM 값은 placeholder 로 생성되며 콘솔/CLI 로 실제 값 갱신(`ignore_changes`).
- 실제 LLM 은 Upstage(OpenAI 호환) 기준. Lambda env 로 키 주입.
