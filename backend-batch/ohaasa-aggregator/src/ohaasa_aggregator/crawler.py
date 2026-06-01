import logging
from datetime import datetime
from zoneinfo import ZoneInfo

import requests


logger = logging.getLogger(__name__)

OHASA_URL = "https://www.asahi.co.jp/data/ohaasa2020/horoscope.json"
CONSTELLATION_MAP = {
    "01": "ARIES",
    "02": "TAURUS",
    "03": "GEMINI",
    "04": "CANCER",
    "05": "LEO",
    "06": "VIRGO",
    "07": "LIBRA",
    "08": "SCORPIO",
    "09": "SAGITTARIUS",
    "10": "CAPRICORN",
    "11": "AQUARIUS",
    "12": "PISCES",
}


def get_ohaasa_info() -> list[dict]:
    response = requests.get(OHASA_URL, timeout=10)
    response.raise_for_status()

    payload = response.json()
    today = datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y%m%d")

    for item in payload:
        if item.get("onair_date") != today:
            continue

        details = sorted(
            item.get("detail", []),
            key=lambda detail: int(detail["ranking_no"]),
        )
        return [
            {
                "rank": int(detail["ranking_no"]),
                "constellation": CONSTELLATION_MAP.get(detail["horoscope_st"], ""),
                "message": " ".join(
                    part.strip()
                    for part in detail.get("horoscope_text", "").split("\t")
                    if part.strip()
                ),
            }
            for detail in details
        ]

    latest_onair_date = max(
        (item.get("onair_date") for item in payload if item.get("onair_date")),
        default=None,
    )
    logger.info(
        "Ohaasa source has no ranking for today; source may not be updated yet",
        extra={"expected_onair_date": today, "latest_onair_date": latest_onair_date},
    )
    return []
