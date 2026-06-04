# 사주홈런 백엔드 부하테스트 가이드

## 파일 구성

| 파일 | 시나리오 | 목적 |
|---|---|---|
| `scenario-a-load.js` | 기본 부하테스트 | VU=50, 5분 지속 — 평상시 처리 능력 검증 |
| `scenario-b-spike.js` | 스파이크 테스트 | 10→200→10 VU — Auto Scaling 반응성 검증 |
| `scenario-c-morning.js` | 새벽 배치 후 아침 트래픽 | Lambda 배치 완료 후 조회 폭증 패턴 검증 |

---

## 사전 준비

### 1. k6 설치

```bash
# macOS
brew install k6

# Linux (Ubuntu/Debian)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

### 2. ALB DNS 확인 및 환경변수 설정

```bash
# infra 디렉토리에서 ALB DNS 확인
cd infra && terraform output alb_dns_name

# 환경변수 설정 (출력된 DNS로 교체)
export BASE_URL="http://sh-alb-xxxxxxxxx.ap-northeast-2.elb.amazonaws.com"
```

### 3. 테스트 데이터 확인

각 스크립트 상단의 `GAME_IDS`, `PLAYER_IDS` 배열을 실제 DB에 존재하는 ID로 교체해야 합니다.

```bash
# RDS에 접속해 실제 ID 확인 (SSM Session Manager 사용)
aws ssm start-session --target <EC2_INSTANCE_ID>
psql -h <RDS_ENDPOINT> -U postgres -d sajuhomerun -c "SELECT id FROM game LIMIT 10;"
psql -h <RDS_ENDPOINT> -U postgres -d sajuhomerun -c "SELECT id FROM player LIMIT 10;"
```

---

## 실행 방법

### 시나리오 A: 기본 부하테스트

```bash
k6 run --env BASE_URL=$BASE_URL scenario-a-load.js
```

**합격 기준**
- `http_req_duration` p(95) < 500ms ✅
- `http_req_failed` rate < 1% ✅

---

### 시나리오 B: 스파이크 테스트

```bash
k6 run --env BASE_URL=$BASE_URL scenario-b-spike.js
```

**합격 기준**
- `http_req_failed` rate < 5% ✅
- 스파이크 종료 후 60초 이내 응답 시간 정상화 → CloudWatch ASG 지표로 확인

**테스트 중 CloudWatch에서 동시 확인할 지표:**
- `AWS/ApplicationELB` → `HTTPCode_Target_5XX_Count`
- `AWS/EC2` → `CPUUtilization` (ASG 단위)
- `AWS/AutoScaling` → `GroupDesiredCapacity` (scale-out/in 타이밍)
- `AWS/RDS` → `DatabaseConnections`

---

### 시나리오 C: 새벽 배치 후 아침 트래픽

```bash
k6 run --env BASE_URL=$BASE_URL scenario-c-morning.js
```

**합격 기준**
- `http_req_duration` p(95) < 800ms ✅
- `http_req_failed` rate < 2% ✅

---

## 결과 리포트 저장 및 시각화

### JSON 리포트 저장

```bash
k6 run --env BASE_URL=$BASE_URL --out json=results-a.json scenario-a-load.js
```

### 로컬 Grafana 시각화 (InfluxDB + Grafana)

```bash
# InfluxDB 실행
docker run -d -p 8086:8086 --name influxdb influxdb:1.8

# Grafana 실행
docker run -d -p 3000:3000 --name grafana grafana/grafana

# k6 실행 시 InfluxDB로 실시간 전송
k6 run --env BASE_URL=$BASE_URL \
  --out influxdb=http://localhost:8086/k6 \
  scenario-a-load.js
```

Grafana 접속 후 (http://localhost:3000, admin/admin):
1. Data Source → InfluxDB 추가 (URL: `http://influxdb:8086`, DB: `k6`)
2. Import Dashboard → ID `2587` 입력 (k6 공식 대시보드)

### HTML 리포트 (k6 내장)

```bash
k6 run --env BASE_URL=$BASE_URL \
  --out json=results.json scenario-a-load.js

# Python으로 간단 요약 확인
python3 -c "
import json
with open('results.json') as f:
    for line in f:
        d = json.loads(line)
        if d.get('type') == 'Point' and d.get('metric') == 'http_req_duration':
            pass  # InfluxDB line protocol
"
```

---

## CloudWatch Logs Insights 쿼리

테스트 중 Spring Boot 에러 집계:

```
fields @timestamp, level, message, traceId
| filter level = "ERROR"
| stats count() as errorCount by bin(1m)
| sort @timestamp desc
```

느린 API 탐지 (500ms 초과):

```
fields @timestamp, method, path, duration
| filter duration > 500
| stats count() as slowCount, avg(duration) as avgDuration by path
| sort slowCount desc
```

---

## 인프라 튜닝 권고사항 (스파이크 60초 복귀 달성)

### 현재 상태의 문제점

| 항목 | 현재 값 | 문제 |
|---|---|---|
| ASG `max_size` | 2 | 인스턴스 1개 추가가 전부 |
| Target Tracking `estimated_instance_warmup` | 기본값 300초 | 60초 복귀 불가 |
| RDS 최대 커넥션 | ~30-40개 (db.t4g.micro) | VU 50+ 시 커넥션 고갈 위험 |
| ALB `deregistration_delay` | 기본값 300초 | 인스턴스 교체 느림 |

### 권장 변경 사항

#### `infra/variables.tf`

```hcl
variable "asg_max_size" {
  default = 4  # 2 → 4
}
```

#### `infra/ec2.tf` — ASG 스케일링 정책

```hcl
resource "aws_autoscaling_policy" "cpu_tracking" {
  name                   = "sh-backend-cpu-tracking"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value              = 50   # 60 → 50 (더 일찍 scale-out)
    estimated_instance_warmup = 60   # 기본 300 → 60초 단축
  }
}
```

#### `infra/alb.tf` — Deregistration Delay 단축

```hcl
resource "aws_lb_target_group" "backend" {
  # ... 기존 설정 ...
  deregistration_delay = 30  # 기본 300 → 30초
}
```

#### `backend-api/src/main/resources/application.yml` — HikariCP 튜닝

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10    # 인스턴스당 10개 × 최대 4대 = 40개 (RDS 한계 이하)
      minimum-idle: 3
      connection-timeout: 3000
      idle-timeout: 30000
```

### 튜닝 후 예상 결과

| 항목 | 튜닝 전 | 튜닝 후 |
|---|---|---|
| Scale-out 반응 | ~5분 | ~60초 |
| Scale-in cooldown | 300초 | 120초 |
| 최대 처리 용량 | 인스턴스 2대 | 인스턴스 4대 |
| RDS 커넥션 여유 | 위험 | 안전 |

> **비용 참고**: t4g.micro 추가 2대 ≈ 월 $6 추가. 예산 제약($30/월) 내 허용 범위.

> **주의**: t4g.micro는 CPU 크레딧 기반 버스트 인스턴스. 스파이크가 장시간 지속되면 크레딧 소진 후 성능 급락 가능. 스파이크 테스트 전 CloudWatch `CPUCreditBalance` 지표 확인 권장.
