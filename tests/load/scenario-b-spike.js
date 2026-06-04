/**
 * Scenario B: 스파이크 테스트 (Spike Test)
 * 조건: 10 VU → 200 VU → 10 VU (ramp-up/down 포함)
 * 합격 기준: 전체 오류율 < 5%, 스파이크 후 60초 이내 응답 정상화
 *
 * 실행: k6 run --env BASE_URL=http://<ALB_DNS> scenario-b-spike.js
 * 주의: CloudWatch ASG GroupDesiredCapacity 지표를 동시에 모니터링할 것
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://REPLACE_WITH_ALB_DNS_NAME';

const errorRate     = new Rate('error_rate');
const recoveryCheck = new Trend('response_after_spike_ms', true);

export const options = {
  stages: [
    { duration: '1m',  target: 10  }, // Phase 1: 정상 트래픽 기준선
    { duration: '30s', target: 200 }, // Phase 2: 스파이크 ramp-up (10 → 200)
    { duration: '1m',  target: 200 }, // Phase 3: 스파이크 유지
    { duration: '30s', target: 10  }, // Phase 4: ramp-down (200 → 10)
    { duration: '2m',  target: 10  }, // Phase 5: 복귀 후 안정화 관찰
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // 합격: 전체 오류율 5% 미만
    // 60초 복귀는 k6 thresholds로 검증 불가 → CloudWatch 타임라인으로 수동 확인
  },
};

export default function () {
  const r = http.get(`${BASE_URL}/api/v1/saju/games/today`);
  const ok = check(r, {
    'status 200':    (r) => r.status === 200,
    '응답 5초 미만': (r) => r.timings.duration < 5000,
  });
  errorRate.add(!ok);

  // Phase 5 구간(VU ≤ 10)에서의 응답 시간을 별도 지표로 수집 → 복귀 확인
  if (__VU <= 10) {
    recoveryCheck.add(r.timings.duration);
  }

  sleep(0.5);
}
