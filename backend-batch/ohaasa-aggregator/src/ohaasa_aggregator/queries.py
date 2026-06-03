UPSERT_ZODIAC_FORTUNE_RANKING_QUERY = """
INSERT INTO zodiac_fortune_rankings (fortune_date, zodiac_sign, rank, fortune_text)
VALUES (%s, %s, %s, %s)
ON CONFLICT (zodiac_sign)
DO UPDATE SET
    fortune_date = EXCLUDED.fortune_date,
    rank = EXCLUDED.rank,
    fortune_text = EXCLUDED.fortune_text,
    updated_at = now()
"""
