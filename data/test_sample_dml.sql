-- Test sample data for local development.
-- Assumes data/ddl.sql has already been applied.

BEGIN;

INSERT INTO teams (name, ranking, ranking_base_date) VALUES
  ('테스트 홈', 1, DATE '2026-06-02'),
  ('테스트 원정', 2, DATE '2026-06-02')
ON CONFLICT (name) DO UPDATE SET
  ranking = EXCLUDED.ranking,
  ranking_base_date = EXCLUDED.ranking_base_date;

INSERT INTO players (team_id, name, position, birth_date, birth_time)
SELECT t.id, v.name, v.position, v.birth_date, v.birth_time
FROM teams t
JOIN (VALUES
  ('테스트 홈', '테스트 타자', '내야수', DATE '1993-03-25', TIME '09:30'),
  ('테스트 홈', '테스트 투수', '투수', DATE '1995-11-30', NULL::time),
  ('테스트 원정', '샘플 포수', '포수', DATE '1998-08-24', TIME '15:00'),
  ('테스트 원정', '샘플 외야수', '외야수', DATE '2000-01-25', NULL::time)
) AS v(team_name, name, position, birth_date, birth_time)
  ON t.name = v.team_name
WHERE NOT EXISTS (
  SELECT 1
  FROM players p
  WHERE p.team_id = t.id
    AND p.name = v.name
    AND p.birth_date = v.birth_date
);

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
  ('테스트 홈', '테스트 타자', DATE '1993-03-25', '계유', '을묘', '갑자', '기사', '갑', '{"wood": 3, "fire": 1, "earth": 1, "metal": 1, "water": 2}'::jsonb),
  ('테스트 홈', '테스트 투수', DATE '1995-11-30', '을해', '정해', '경신', NULL, '경', '{"wood": 1, "fire": 1, "earth": 0, "metal": 2, "water": 2}'::jsonb),
  ('테스트 원정', '샘플 포수', DATE '1998-08-24', '무인', '경신', '병오', '병신', '병', '{"wood": 1, "fire": 3, "earth": 1, "metal": 3, "water": 0}'::jsonb),
  ('테스트 원정', '샘플 외야수', DATE '2000-01-25', '기묘', '정축', '임오', NULL, '임', '{"wood": 1, "fire": 2, "earth": 2, "metal": 0, "water": 1}'::jsonb)
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

INSERT INTO games (game_date, game_time, home_team_id, away_team_id)
SELECT DATE '2026-06-02', TIME '18:30', home_team.id, away_team.id
FROM teams home_team
JOIN teams away_team ON away_team.name = '테스트 원정'
WHERE home_team.name = '테스트 홈'
ON CONFLICT (game_date, home_team_id, away_team_id) DO UPDATE SET
  game_time = EXCLUDED.game_time;

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
    '테스트 홈',
    '테스트 타자',
    DATE '1993-03-25',
    '{"day_master_element": "목", "target_element": "화", "relation": "generates"}'::jsonb,
    '{"relation": "생", "ten_god": "식신", "keywords": ["타격감", "존재감"]}'::jsonb,
    '테스트 경기에서 공격 흐름을 만드는 장면이 기대됩니다.',
    78,
    'GENERATED',
    1,
    TIMESTAMP '2026-06-02 12:00:00'
  ),
  (
    '테스트 홈',
    '테스트 투수',
    DATE '1995-11-30',
    '{"day_master_element": "금", "target_element": "화", "relation": "controlled_by"}'::jsonb,
    '{"relation": "극", "ten_god": "정관", "keywords": ["압박감", "집중력"]}'::jsonb,
    NULL,
    NULL,
    'PENDING',
    0,
    NULL
  ),
  (
    '테스트 원정',
    '샘플 포수',
    DATE '1998-08-24',
    '{"day_master_element": "화", "target_element": "화", "relation": "same"}'::jsonb,
    '{"relation": "동일", "ten_god": "비견", "keywords": ["승부욕", "꾸준함"]}'::jsonb,
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

INSERT INTO zodiac_fortune_rankings (zodiac_sign, fortune_date, rank) VALUES
  ('ARIES', DATE '2026-06-02', 1),
  ('TAURUS', DATE '2026-06-02', 2),
  ('GEMINI', DATE '2026-06-02', 3),
  ('CANCER', DATE '2026-06-02', 4),
  ('LEO', DATE '2026-06-02', 5),
  ('VIRGO', DATE '2026-06-02', 6),
  ('LIBRA', DATE '2026-06-02', 7),
  ('SCORPIO', DATE '2026-06-02', 8),
  ('SAGITTARIUS', DATE '2026-06-02', 9),
  ('CAPRICORN', DATE '2026-06-02', 10),
  ('AQUARIUS', DATE '2026-06-02', 11),
  ('PISCES', DATE '2026-06-02', 12)
ON CONFLICT (zodiac_sign) DO UPDATE SET
  fortune_date = EXCLUDED.fortune_date,
  rank = EXCLUDED.rank,
  updated_at = now();

COMMIT;
