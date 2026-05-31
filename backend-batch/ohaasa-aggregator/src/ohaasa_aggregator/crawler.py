import logging
from datetime import datetime
from zoneinfo import ZoneInfo

import requests


logger = logging.getLogger(__name__)

OHASA_URL = "https://www.asahi.co.jp/data/ohaasa2020/horoscope.json"
CONSTELLATION_MAP = {
    "01": "양자리",
    "02": "황소자리",
    "03": "쌍둥이자리",
    "04": "게자리",
    "05": "사자자리",
    "06": "처녀자리",
    "07": "천칭자리",
    "08": "전갈자리",
    "09": "사수자리",
    "10": "염소자리",
    "11": "물병자리",
    "12": "물고기자리",
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
