# 사주홈런(Saju-Homerun) Infrastructure Prompt Context & Guide

## 1. 프로젝트 및 예산/일정 제약 조건
- **목표**: 실제 사용자를 유치하는 "선수 사주 기반 당일 경기 승률 예측 서비스" 인프라 구축
- **리전**: AWS 서울 리전 (`ap-northeast-2`)
- **도구**: Terraform 

- **비용 제한 (Pricing Calculator 제출 필수)**:
  - 실제 운영 기간: 월 $50 이하
- **상태 관리(State)**: S3 원격 백엔드 + DynamoDB를 이용한 State Locking 구성 필수.

---

## 2. 네트워크(VPC) 및 비용 방어 아키텍처 규칙

### ① NAT 인스턴스 (비용 방어 핵심)
- AWS Managed NAT Gateway(월 ~$32 고정 비용) 사용 절대 금지.
- **NAT 인스턴스(EC2)** `t4g.micro`로 대체 구성.
  - Terraform 설정 시 반드시 `source_dest_check = false`로 지정할 것.
  - Public Subnet에 배치하고 퍼블릭 IP(또는 EIP) 할당.
  - `user_data`를 통해 `iptables` IP 포워딩 스크립트 주입 필수.
  - Private Subnet의 Route Table에서 `0.0.0.0/0` 경로의 `network_interface_id`로 이 NAT 인스턴스의 ENI를 바인딩할 것.

### ② ALB 및 EC2 (백엔드 서버)
- Public Subnet에 Application Load Balancer(ALB) 배치.
- 백엔드(Spring Boot 도커 컨테이너) 가동을 위한 EC2 인스턴스는 비용 효율화를 위해 **스팟 인스턴스(Spot Instance)** 옵션 적용.

### ③ 데이터베이스 (RDS)
- Amazon RDS PostgreSQL (`db.t4g.micro`, Single-AZ, 저장소 20GB 표준) 구성.
- 비용 제한을 위해 프리티어 범주 혹은 최저 스펙으로 고정하며, 외부 직접 노출 금지(Isolated Private Subnet 배치).
- Spring Boot EC2와 자원 수집 Lambda에서만 접근 가능하도록 Security Group 설정 유기적 결합.

---

## 3. 데이터 파이프라인 및 Lambda 함수 세부 명세

모든 Lambda 함수는 컨테이너 이미지 기반(Container Runtime)으로 동작하므로 AWS ECR(Elastic Container Registry) 리포지토리 정의와 결합되어야 합니다. 또한 외부 인터넷 통신(LLM API 호출 및 크롤링)이 필요하므로 **Private Subnet에 배치하고, NAT 인스턴스를 거쳐 나가도록** 라우팅과 Security Group을 지정해야 합니다.

### [함수 1] 경기 정보 구단 순위 크롤러 Lambda (`sh-lambda-game-crawler`)
- **트리거**: EventBridge Scheduler (매일 새벽 또는 경기 전 정기 스케줄링)
- **역할**: 외부 스포츠 API 또는 웹 페이지로부터 당일 야구 경기 일정 및 구단 순위 데이터를 크롤링.
- **출력**: 정제된 데이터를 SQS 대기열(`sh-msg-queue`)로 메시지 발행.

### [함수 2] 오하아시 위클리 수집 Lambda (`sh-lambda-fortune-crawler`)
- **트리거**: EventBridge Scheduler (정기 스케줄링)
- **역할**: 당일 운세 지표 및 사주 관련 참고 데이터를 크롤링 및 가공.
- **출력**: SQS 대기열(`sh-msg-queue`)로 운세 메시지 발행.

### [함수 3] 사주 점수, 문장 생성 후 저장 Worker Lambda (`sh-lambda-llm-worker`)
- **트리거**: SQS (`sh-msg-queue`) 메시지 인입 시 이벤트 소스 매핑(Event Source Mapping)으로 자동 트리거.
- **역할**:
  1. 수집된 경기/운세 메시지를 소비(Consume).
  2. 사주 매칭 알고리즘 가동 및 외부 LLM API(Anthropic Claude 또는 OpenAI)를 호출하여 최종 승률 예측 분석 문장 생성.
  3. 프라이빗 VPC 내부에 있는 Postgres RDS에 직접 접속하여 최종 예측 점수 및 텍스트 데이터 `INSERT`/`UPDATE`.
- **오류 처리**: 3회 이상 처리 실패 시 비동기 전송 장애 처리를 위해 데드 레터 큐(DLQ, `sh-dlq`)로 메시지가 인입되도록 테라폼 큐 정책 설정 필수.

---

## 4. CI/CD 및 모니터링/로그 요구사항

### ① CI/CD 
- aws 인프라 구축 후에 자세한 내용 정의. 

### ② 로그 및 가산점 전략 (비용 $0 옵저버빌리티)
- 모든 EC2 및 Lambda의 로그는 CloudWatch Logs로 집중 스트리밍.
- CloudWatch Logs Insights를 통해 JSON 포맷의 구조화된 로그를 분석할 수 있도록 로그 그룹 정의.
- 오류율 급증 시 Slack 알림 트리거를 위한 CloudWatch Alarm 및 SNS 토픽 연동 뼈대 마련.

---

## 5. 테라폼 코드 생성 요청 시 규칙 (AI 지침)
1. **변수화**: 리전(`ap-northeast-2`), 인스턴스 타입(`t4g.micro`), DB 이름 등은 모두 `variables.tf`로 분리해라.
2. **출력(Outputs)**: 인프라 구성 완료 후 ALB의 DNS Name, RDS의 Endpoint를 터미널에 출력하도록 `outputs.tf`를 작성해라.
3. **태그 구성**: 모든 리소스에는 `Project = "SajuHomerun"`, `Environment = "Dev"` 태그를 필수 부착해라.