INSERT INTO app_settings (setting_key, setting_value)
VALUES ('service_today', '2026-06-02')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();