from datetime import datetime
import logging

from sajupy import calculate_saju

from src.schema import GameSaju, PlayerSaju

logger = logging.getLogger(__name__)

STEM_TO_KOREAN = {
    "甲": "갑",
    "乙": "을",
    "丙": "병",
    "丁": "정",
    "戊": "무",
    "己": "기",
    "庚": "경",
    "辛": "신",
    "壬": "임",
    "癸": "계",
}

BRANCH_TO_KOREAN = {
    "子": "자",
    "丑": "축",
    "寅": "인",
    "卯": "묘",
    "辰": "진",
    "巳": "사",
    "午": "오",
    "未": "미",
    "申": "신",
    "酉": "유",
    "戌": "술",
    "亥": "해",
}

ELEMENT_BY_STEM = {
    "甲": "목",
    "乙": "목",
    "丙": "화",
    "丁": "화",
    "戊": "토",
    "己": "토",
    "庚": "금",
    "辛": "금",
    "壬": "수",
    "癸": "수",
}

ELEMENT_BY_BRANCH = {
    "寅": "목",
    "卯": "목",
    "巳": "화",
    "午": "화",
    "辰": "토",
    "戌": "토",
    "丑": "토",
    "未": "토",
    "申": "금",
    "酉": "금",
    "亥": "수",
    "子": "수",
}


def _pillar_to_korean(pillar: str) -> str:
    return "".join(STEM_TO_KOREAN.get(char, BRANCH_TO_KOREAN.get(char, char)) for char in pillar)


def _stem_to_korean(stem: str) -> str:
    return STEM_TO_KOREAN[stem]


def _count_five_elements(saju_result: dict[str, str], include_hour: bool) -> dict[str, int]:
    counts = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}

    stems = [saju_result["year_stem"], saju_result["month_stem"], saju_result["day_stem"]]
    branches = [saju_result["year_branch"], saju_result["month_branch"], saju_result["day_branch"]]

    if include_hour:
        stems.append(saju_result["hour_stem"])
        branches.append(saju_result["hour_branch"])

    for stem in stems:
        counts[ELEMENT_BY_STEM[stem]] += 1

    for branch in branches:
        counts[ELEMENT_BY_BRANCH[branch]] += 1

    return counts

def get_player_saju_info(name: str, player_id: int, year: str, month: str, day: str, hour: str | None = None) -> PlayerSaju:
    """선수 사주 정보 계산

    Args:
        name (str): 선수 이름
        player_id (int): 선수 ID
        year (str): 선수 출생 년도. 예: "1990"
        month (str): 선수 출생 월. 예: "05"
        day (str): 선수 출생 일. 예: "15"
        hour (str | None, optional): 선수 출생 시간. 예: "09". Defaults to None.

    Returns:
        PlayerSaju: 선수 사주 정보 객체
    """
    logger.info(
        "Calculating player saju",
        extra={
            "player_name": name,
            "player_id": player_id,
            "birth_year": year,
            "birth_month": month,
            "birth_day": day,
            "birth_hour": hour,
        },
    )
    calculated_hour = int(hour) if hour is not None else 12
    saju_result = calculate_saju(
        year=int(year),
        month=int(month),
        day=int(day),
        hour=calculated_hour,
    )

    player_saju = PlayerSaju(
        name=name,
        player_id=player_id,
        year_pillar=_pillar_to_korean(saju_result["year_pillar"]),
        month_pillar=_pillar_to_korean(saju_result["month_pillar"]),
        day_pillar=_pillar_to_korean(saju_result["day_pillar"]),
        hour_pillar=_pillar_to_korean(saju_result["hour_pillar"]) if hour is not None else None,
        day_master=_stem_to_korean(saju_result["day_stem"]),
        five_elements=_count_five_elements(saju_result, include_hour=hour is not None),
    )
    logger.info(
        "Calculated player saju",
        extra={
            "player_name": name,
            "player_id": player_id,
            "day_master": player_saju.day_master,
            "has_birth_hour": hour is not None,
        },
    )
    return player_saju


def get_game_saju_info(game_date: str) -> GameSaju:
    """경기일 사주 정보 계산

    Args:
        game_date (str): 경기 날짜. 예: "2025-05-27"

    Returns:
        GameSaju: 경기일 사주 정보 객체
    """
    logger.info("Calculating game saju", extra={"game_date": game_date})
    parsed_date = datetime.strptime(game_date, "%Y-%m-%d")
    saju_result = calculate_saju(
        year=parsed_date.year,
        month=parsed_date.month,
        day=parsed_date.day,
        hour=12,
    )

    game_saju = GameSaju(
        game_date=game_date,
        day_stem=_stem_to_korean(saju_result["day_stem"]),
        day_branch=BRANCH_TO_KOREAN[saju_result["day_branch"]],
    )
    logger.info(
        "Calculated game saju",
        extra={
            "game_date": game_date,
            "day_stem": game_saju.day_stem,
            "day_branch": game_saju.day_branch,
        },
    )
    return game_saju
