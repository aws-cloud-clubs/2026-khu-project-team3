import asyncio
import logging
from datetime import date, datetime
from typing import Sequence
from zoneinfo import ZoneInfo

from common.db import get_connection
from ohaasa_aggregator.crawler import get_ohaasa_info
from ohaasa_aggregator.llm import (
    OhaasaFortuneInput,
    convert_ohaasa_fortune,
    create_llm_client,
)
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

    ohaasa_info = asyncio.run(_convert_fortune_texts(ohaasa_info))

    with get_connection() as conn:
        with conn.cursor() as cur:
            _upsert_zodiac_fortune_rankings(cur, fortune_date, ohaasa_info)


async def _convert_fortune_texts(ohaasa_info: Sequence[dict]) -> list[dict]:
    async with create_llm_client() as client:
        converted_outputs = await asyncio.gather(
            *(
                convert_ohaasa_fortune(
                    OhaasaFortuneInput(
                        zodiac_sign=item["constellation"],
                        rank=item["rank"],
                        original_text=item["fortune_text"],
                    ),
                    client,
                )
                for item in ohaasa_info
            )
        )

    return [
        {**item, "fortune_text": output.fortune_text}
        for item, output in zip(ohaasa_info, converted_outputs, strict=True)
    ]


def _upsert_zodiac_fortune_rankings(cur, fortune_date: str, ohaasa_info: Sequence[dict]) -> None:
    parsed_fortune_date = date.fromisoformat(fortune_date)

    for item in ohaasa_info:
        cur.execute(
            UPSERT_ZODIAC_FORTUNE_RANKING_QUERY,
            (parsed_fortune_date, item["constellation"], item["rank"], item["fortune_text"]),
        )
