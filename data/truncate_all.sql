-- Remove all application data while keeping the schema.
-- Use only for local/dev reset.

BEGIN;

TRUNCATE TABLE
  app_settings,
  daily_saju_report,
  games,
  player_saju,
  players,
  teams,
  zodiac_fortune_rankings
RESTART IDENTITY CASCADE;

COMMIT;
