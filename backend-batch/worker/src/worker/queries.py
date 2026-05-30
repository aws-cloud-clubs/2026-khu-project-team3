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

GET_WORKER_TEST_MESSAGES_QUERY = """
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
LIMIT %s
"""
