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
VALUES (%s, %s, %s, %s, %s, %s, %s, 'PENDING', NULL)
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
WHERE daily_saju_report.status = 'FAILED'
RETURNING id
"""

GET_DAILY_SAJU_REPORT_FAILED_ID_QUERY = """
SELECT id
FROM daily_saju_report
WHERE player_id = %s
  AND game_date = %s
  AND status = 'FAILED'
"""
