import logging
from datetime import date, datetime
from typing import Sequence
from zoneinfo import ZoneInfo

from common.db import get_connection
from ohaasa_aggregator.crawler import get_ohaasa_info
from ohaasa_aggregator.queries import UPSERT_ZODIAC_FORTUNE_RANKING_QUERY


logger = logging.getLogger(__name__)


def aggregate() -> None:
    ohaasa_info = get_ohaasa_info()
    fortune_date = datetime.now(ZoneInfo("Asia/Seoul")).date().isoformat()

    if not ohaasa_info:
        logger.warning(
            "No Ohaasa fortune rankings found for target date",
            extra={"fortune_date": fortune_date},
        )
        return

    with get_connection() as conn:
        with conn.cursor() as cur:
            _upsert_zodiac_fortune_rankings(cur, fortune_date, ohaasa_info)


def _upsert_zodiac_fortune_rankings(cur, fortune_date: str, ohaasa_info: Sequence[dict]) -> None:
    parsed_fortune_date = date.fromisoformat(fortune_date)

    for item in ohaasa_info:
        cur.execute(
            UPSERT_ZODIAC_FORTUNE_RANKING_QUERY,
            (parsed_fortune_date, item["constellation"], item["rank"], item["fortune_text"]),
        )
