/**
 * Scenario A: 기본 부하테스트 (Load Test)
 * 조건: VU=50, 5분 지속
 * 합격 기준: p(95) < 500ms, 오류율 < 1%
 *
 * 실행: k6 run --env BASE_URL=http://<ALB_DNS> scenario-a-load.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://REPLACE_WITH_ALB_DNS_NAME';

const apiErrors   = new Counter('api_errors');
const gameDetailT = new Trend('game_detail_duration_ms', true);

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // warm-up: 0 → 50
    { duration: '5m',  target: 50 }, // 지속 부하: 50 VU × 5분
    { duration: '30s', target: 0  }, // cool-down
  ],
  thresholds: {
    http_req_duration:       ['p(95)<500'], // 합격: 95th percentile ≤ 500ms
    http_req_failed:         ['rate<0.01'], // 합격: 오류율 < 1%
    game_detail_duration_ms: ['p(95)<500'],
  },
};

// 실제 DB에 존재하는 ID로 교체 필요
const GAME_IDS   = [1, 2, 3, 4, 5];
const PLAYER_IDS = [1, 2, 3, 10, 20, 30];

export default function () {
  const h = { headers: { 'Accept': 'application/json' } };

  group('메인 화면 - 오늘 경기 조회', () => {
    const r = http.get(`${BASE_URL}/api/v1/saju/games/today`, h);
    const ok = check(r, {
      'status 200': (r) => r.status === 200,
      '200ms 미만':  (r) => r.timings.duration < 200,
    });
    if (!ok) apiErrors.add(1);
  });

  sleep(Math.random() * 2 + 1); // think time 1~3초

  group('경기 상세 - 사주 운세 조회', () => {
    const gameId = GAME_IDS[__VU % GAME_IDS.length];
    const start  = Date.now();
    const r = http.get(`${BASE_URL}/api/v1/saju/games/${gameId}`, h);
    gameDetailT.add(Date.now() - start);
    const ok = check(r, { 'status 200': (r) => r.status === 200 });
    if (!ok) apiErrors.add(1);
  });

  sleep(Math.random() * 2 + 1);

  group('팀 랭킹 조회', () => {
    const r = http.get(`${BASE_URL}/api/v1/saju/teams/ranking`, h);
    check(r, { 'status 200': (r) => r.status === 200 });
  });

  sleep(1);
}
