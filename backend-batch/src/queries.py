GET_TEAM_ID_BY_NAME_QUERY = "SELECT id, name FROM teams WHERE name = ANY(%s)"

UPDATE_TEAM_RANKING_QUERY = """
UPDATE teams
SET ranking = %s,
    ranking_base_date = %s
WHERE name = %s
"""

UPSERT_GAME_QUERY = """
INSERT INTO games (game_date, game_time, home_team_id, away_team_id)
VALUES (%s, %s, %s, %s)
ON CONFLICT (game_date, home_team_id, away_team_id)
DO UPDATE SET game_time = EXCLUDED.game_time
"""

GET_PLAYERS_FOR_SCHEDULED_TEAMS_QUERY = """
SELECT DISTINCT p.id, p.name, p.birth_date, p.birth_time, ps.day_master
FROM players p
LEFT JOIN player_saju ps ON ps.player_id = p.id
WHERE p.team_id = ANY(%s)
ORDER BY p.id
"""

INSERT_PLAYER_SAJU_QUERY = """
INSERT INTO player_saju (
    player_id,
    year_pillar,
    month_pillar,
    day_pillar,
    hour_pillar,
    day_master,
    five_elements
)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (player_id) DO NOTHING
"""

INSERT_DAILY_SAJU_REPORT_QUERY = """
INSERT INTO daily_saju_report (
    player_id,
    game_date,
    game_day_stem,
    game_day_branch,
    five_element_interaction,
    ten_god_interaction,
    prompt_version,
    status,
    error_message
)
VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending', NULL)
ON CONFLICT (player_id, game_date)
DO UPDATE SET
    game_day_stem = EXCLUDED.game_day_stem,
    game_day_branch = EXCLUDED.game_day_branch,
    five_element_interaction = EXCLUDED.five_element_interaction,
    ten_god_interaction = EXCLUDED.ten_god_interaction,
    prompt_version = EXCLUDED.prompt_version,
    status = EXCLUDED.status,
    error_message = EXCLUDED.error_message,
    updated_at = now()
WHERE daily_saju_report.status = 'failed'
RETURNING id
"""

GET_DAILY_SAJU_REPORT_FAILED_ID_QUERY = """
SELECT id
FROM daily_saju_report
WHERE player_id = %s
  AND game_date = %s
  AND status = 'failed'
"""

MARK_DAILY_SAJU_REPORT_GENERATING_QUERY = """
UPDATE daily_saju_report
SET status = 'generating',
    attempt_count = attempt_count + 1,
    error_message = NULL,
    updated_at = now()
WHERE player_id = %s
  AND game_date = %s
"""

UPDATE_DAILY_SAJU_REPORT_GENERATED_QUERY = """
UPDATE daily_saju_report
SET status = 'generated',
    report_text = %s,
    lucky_index = %s,
    error_message = NULL,
    generated_at = now(),
    updated_at = now()
WHERE player_id = %s
  AND game_date = %s
"""

UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY = """
UPDATE daily_saju_report
SET status = 'failed',
    error_message = %s,
    updated_at = now()
WHERE player_id = %s
  AND game_date = %s
"""

GET_WORKER_TEST_MESSAGE_QUERY = """
SELECT
    dsr.player_id,
    dsr.game_date,
    ps.day_master,
    dsr.game_day_stem
FROM daily_saju_report dsr
JOIN player_saju ps ON ps.player_id = dsr.player_id
WHERE dsr.status IN ('pending', 'failed')
  AND dsr.game_day_stem IS NOT NULL
  AND ps.day_master IS NOT NULL
ORDER BY dsr.created_at
LIMIT 1
"""

DELETE_ZODIAC_FORTUNE_RANKINGS_BY_DATE_QUERY = """
DELETE FROM zodiac_fortune_rankings
WHERE fortune_date = %s
"""

INSERT_ZODIAC_FORTUNE_RANKING_QUERY = """
INSERT INTO zodiac_fortune_rankings (fortune_date, zodiac_sign, rank)
VALUES (%s, %s, %s)
"""
