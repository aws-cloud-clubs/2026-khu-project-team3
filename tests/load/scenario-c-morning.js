/**
 * Scenario C: 새벽 배치 후 아침 트래픽 (Morning Batch + Traffic Ramp-up)
 *
 * 선택 이유: 실제 아키텍처와 정확히 일치하는 시나리오
 *   새벽 6시 game-crawler Lambda → SQS → llm-worker Lambda → RDS 저장 완료
 *   낮 12시 fortune-crawler Lambda → SQS → llm-worker Lambda → RDS 저장 완료
 *   → 이후 유저가 "오늘 경기 사주 운세" 조회하며 트래픽 폭증
 *
 * 합격 기준: p(95) < 800ms (배치 직후 DB 부하 감안), 오류율 < 2%
 *
 * 실행: k6 run --env BASE_URL=http://<ALB_DNS> scenario-c-morning.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL    = __ENV.BASE_URL || 'http://REPLACE_WITH_ALB_DNS_NAME';
const batchErrors = new Counter('post_batch_errors');

export const options = {
  stages: [
    // Phase 1: 새벽 대기 — 배치 실행 전, 매우 가벼운 트래픽
    { duration: '1m', target: 3  },
    { duration: '1m', target: 5  },
    // Phase 2: 배치 완료 후 점진적 유입 (6시 이후 사용자 유입 시작)
    { duration: '2m', target: 20 },
    { duration: '1m', target: 35 },
    // Phase 3: 아침 피크 — 경기 시작 전 조회 폭증 (가장 중요한 검증 구간)
    { duration: '3m', target: 80 },
    // Phase 4: 자연 감소
    { duration: '2m', target: 15 },
    { duration: '1m', target: 0  },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 배치 직후 DB 부하 고려해 800ms 허용
    http_req_failed:   ['rate<0.02'],
  },
};

// 실제 DB에 존재하는 ID로 교체 필요
const GAME_IDS   = [1, 2, 3, 4, 5];
const PLAYER_IDS = [1, 2, 3, 10, 20, 30];

export default function () {
  group('앱 진입 - 오늘 경기 목록', () => {
    const r  = http.get(`${BASE_URL}/api/v1/saju/games/today`);
    const ok = check(r, {
      'status 200':           (r) => r.status === 200,
      '데이터 비어있지 않음': (r) => r.body && r.body.length > 10,
    });
    if (!ok) batchErrors.add(1);
  });

  sleep(Math.random() * 3 + 1); // think time 1~4초

  group('경기 클릭 - 사주 운세 상세', () => {
    const gameId = GAME_IDS[__VU % GAME_IDS.length];
    const r = http.get(`${BASE_URL}/api/v1/saju/games/${gameId}`);
    check(r, { 'status 200': (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1);

  // 40% 확률로 선수 운세 추가 조회 (실제 사용 패턴 반영)
  if (Math.random() < 0.4) {
    group('선수 운세 조회', () => {
      const playerId = PLAYER_IDS[__VU % PLAYER_IDS.length];
      const r = http.get(`${BASE_URL}/api/v1/saju/players/${playerId}`);
      check(r, { 'status 200': (r) => r.status === 200 });
    });
    sleep(1);
  }
}
