-- Test sample data for local development.
-- Assumes data/ddl.sql has already been applied.

BEGIN;

INSERT INTO app_settings (setting_key, setting_value)
VALUES ('service_today', '2026-06-02')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

INSERT INTO teams (name, logo_image_path, ranking, ranking_base_date) VALUES
  ('LG', 'data/images/LG/LG.png', 2, DATE '2026-06-02'),
  ('삼성', 'data/images/삼성/삼성.png', 1, DATE '2026-06-02')
ON CONFLICT (name) DO UPDATE SET
  logo_image_path = EXCLUDED.logo_image_path,
  ranking = EXCLUDED.ranking,
  ranking_base_date = EXCLUDED.ranking_base_date;

INSERT INTO players (team_id, name, profile_image_path, position, birth_date, birth_time)
SELECT t.id, v.name, v.profile_image_path, v.position, v.birth_date, v.birth_time
FROM teams t
JOIN (VALUES
  ('LG', '홍창기', 'data/images/LG/players/홍창기.png', '외야수', DATE '1993-11-21', TIME '09:30'),
  ('LG', '임찬규', 'data/images/LG/players/임찬규.png', '투수', DATE '1992-11-20', NULL::time),
  ('삼성', '강민호', 'data/images/삼성/players/강민호.png', '포수', DATE '1985-08-18', TIME '15:00'),
  ('삼성', '구자욱', 'data/images/삼성/players/구자욱.png', '외야수', DATE '1993-02-12', NULL::time)
) AS v(team_name, name, profile_image_path, position, birth_date, birth_time)
  ON t.name = v.team_name
WHERE NOT EXISTS (
  SELECT 1
  FROM players p
  WHERE p.team_id = t.id
    AND p.name = v.name
    AND p.birth_date = v.birth_date
);

UPDATE players p
SET
  profile_image_path = v.profile_image_path,
  position = v.position,
  birth_time = v.birth_time
FROM teams t
JOIN (VALUES
  ('LG', '홍창기', 'data/images/LG/players/홍창기.png', '외야수', DATE '1993-11-21', TIME '09:30'),
  ('LG', '임찬규', 'data/images/LG/players/임찬규.png', '투수', DATE '1992-11-20', NULL::time),
  ('삼성', '강민호', 'data/images/삼성/players/강민호.png', '포수', DATE '1985-08-18', TIME '15:00'),
  ('삼성', '구자욱', 'data/images/삼성/players/구자욱.png', '외야수', DATE '1993-02-12', NULL::time)
) AS v(team_name, player_name, profile_image_path, position, birth_date, birth_time)
  ON t.name = v.team_name
WHERE p.team_id = t.id
  AND p.name = v.player_name
  AND p.birth_date = v.birth_date;

INSERT INTO player_saju (
  player_id,
  year_pillar,
  month_pillar,
  day_pillar,
  hour_pillar,
  day_master,
  five_elements
)
SELECT
  p.id,
  v.year_pillar,
  v.month_pillar,
  v.day_pillar,
  v.hour_pillar,
  v.day_master,
  v.five_elements
FROM players p
JOIN teams t ON t.id = p.team_id
JOIN (VALUES
  ('LG', '홍창기', DATE '1993-11-21', '계유', '계해', '무신', '정사', '무', '{"wood": 0, "fire": 2, "earth": 2, "metal": 2, "water": 2}'::jsonb),
  ('LG', '임찬규', DATE '1992-11-20', '임신', '신해', '정유', NULL, '정', '{"wood": 0, "fire": 1, "earth": 0, "metal": 3, "water": 3}'::jsonb),
  ('삼성', '강민호', DATE '1985-08-18', '을축', '갑신', '기축', '임신', '기', '{"wood": 2, "fire": 0, "earth": 3, "metal": 2, "water": 1}'::jsonb),
  ('삼성', '구자욱', DATE '1993-02-12', '계유', '갑인', '신미', NULL, '신', '{"wood": 2, "fire": 0, "earth": 1, "metal": 2, "water": 1}'::jsonb)
) AS v(team_name, player_name, birth_date, year_pillar, month_pillar, day_pillar, hour_pillar, day_master, five_elements)
  ON t.name = v.team_name
 AND p.name = v.player_name
 AND p.birth_date = v.birth_date
ON CONFLICT (player_id) DO UPDATE SET
  year_pillar = EXCLUDED.year_pillar,
  month_pillar = EXCLUDED.month_pillar,
  day_pillar = EXCLUDED.day_pillar,
  hour_pillar = EXCLUDED.hour_pillar,
  day_master = EXCLUDED.day_master,
  five_elements = EXCLUDED.five_elements;

INSERT INTO games (game_date, game_time, stadium, home_team_id, away_team_id)
SELECT DATE '2026-06-02', TIME '18:30', '잠실야구장', home_team.id, away_team.id
FROM teams home_team
JOIN teams away_team ON away_team.name = '삼성'
WHERE home_team.name = 'LG'
ON CONFLICT (game_date, home_team_id, away_team_id) DO UPDATE SET
  game_time = EXCLUDED.game_time,
  stadium = EXCLUDED.stadium;

INSERT INTO daily_saju_report (
  player_id,
  game_date,
  game_day_stem,
  game_day_branch,
  five_element_interaction,
  ten_god_interaction,
  report_text,
  lucky_index,
  status,
  prompt_version,
  attempt_count,
  error_message,
  generated_at
)
SELECT
  p.id,
  DATE '2026-06-02',
  '병',
  '오',
  v.five_element_interaction,
  v.ten_god_interaction,
  v.report_text,
  v.lucky_index,
  v.status::report_status,
  'test-v1',
  v.attempt_count,
  NULL,
  v.generated_at
FROM players p
JOIN teams t ON t.id = p.team_id
JOIN (VALUES
  (
    'LG',
    '홍창기',
    DATE '1993-11-21',
    '{"day_master_element": "토", "target_element": "화", "relation": "generated_by"}'::jsonb,
    '{"relation": "생", "ten_god": "인성", "keywords": ["출루", "집중력"]}'::jsonb,
    '출루 흐름을 살리고 공격의 연결 고리를 만드는 장면이 기대됩니다.',
    78,
    'GENERATED',
    1,
    TIMESTAMP '2026-06-02 12:00:00'
  ),
  (
    'LG',
    '임찬규',
    DATE '1992-11-20',
    '{"day_master_element": "화", "target_element": "화", "relation": "same"}'::jsonb,
    '{"relation": "동일", "ten_god": "비견", "keywords": ["제구", "승부욕"]}'::jsonb,
    NULL,
    NULL,
    'PENDING',
    0,
    NULL
  ),
  (
    '삼성',
    '강민호',
    DATE '1985-08-18',
    '{"day_master_element": "토", "target_element": "화", "relation": "generated_by"}'::jsonb,
    '{"relation": "생", "ten_god": "인성", "keywords": ["리드", "안정감"]}'::jsonb,
    NULL,
    NULL,
    'FAILED',
    1,
    NULL
  )
) AS v(
  team_name,
  player_name,
  birth_date,
  five_element_interaction,
  ten_god_interaction,
  report_text,
  lucky_index,
  status,
  attempt_count,
  generated_at
)
  ON t.name = v.team_name
 AND p.name = v.player_name
 AND p.birth_date = v.birth_date
ON CONFLICT (player_id, game_date) DO UPDATE SET
  game_day_stem = EXCLUDED.game_day_stem,
  game_day_branch = EXCLUDED.game_day_branch,
  five_element_interaction = EXCLUDED.five_element_interaction,
  ten_god_interaction = EXCLUDED.ten_god_interaction,
  report_text = EXCLUDED.report_text,
  lucky_index = EXCLUDED.lucky_index,
  status = EXCLUDED.status,
  prompt_version = EXCLUDED.prompt_version,
  attempt_count = EXCLUDED.attempt_count,
  error_message = EXCLUDED.error_message,
  generated_at = EXCLUDED.generated_at,
  updated_at = now();

INSERT INTO zodiac_fortune_rankings (zodiac_sign, fortune_date, rank, fortune_text) VALUES
  ('ARIES', DATE '2026-06-02', 1, '테스트 양자리 운세입니다.'),
  ('TAURUS', DATE '2026-06-02', 2, '테스트 황소자리 운세입니다.'),
  ('GEMINI', DATE '2026-06-02', 3, '테스트 쌍둥이자리 운세입니다.'),
  ('CANCER', DATE '2026-06-02', 4, '테스트 게자리 운세입니다.'),
  ('LEO', DATE '2026-06-02', 5, '테스트 사자자리 운세입니다.'),
  ('VIRGO', DATE '2026-06-02', 6, '테스트 처녀자리 운세입니다.'),
  ('LIBRA', DATE '2026-06-02', 7, '테스트 천칭자리 운세입니다.'),
  ('SCORPIO', DATE '2026-06-02', 8, '테스트 전갈자리 운세입니다.'),
  ('SAGITTARIUS', DATE '2026-06-02', 9, '테스트 사수자리 운세입니다.'),
  ('CAPRICORN', DATE '2026-06-02', 10, '테스트 염소자리 운세입니다.'),
  ('AQUARIUS', DATE '2026-06-02', 11, '테스트 물병자리 운세입니다.'),
  ('PISCES', DATE '2026-06-02', 12, '테스트 물고기자리 운세입니다.')
ON CONFLICT (zodiac_sign) DO UPDATE SET
  fortune_date = EXCLUDED.fortune_date,
  rank = EXCLUDED.rank,
  fortune_text = EXCLUDED.fortune_text,
  updated_at = now();

COMMIT;
