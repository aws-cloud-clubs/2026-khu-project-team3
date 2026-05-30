UPSERT_ZODIAC_FORTUNE_RANKING_QUERY = """
INSERT INTO zodiac_fortune_rankings (fortune_date, zodiac_sign, rank)
VALUES (%s, %s, %s)
ON CONFLICT (zodiac_sign)
DO UPDATE SET
    fortune_date = EXCLUDED.fortune_date,
    rank = EXCLUDED.rank,
    updated_at = now()
"""
