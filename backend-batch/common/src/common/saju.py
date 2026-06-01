from datetime import datetime
import logging

from sajupy import calculate_saju

from common.schema import GameSaju, PlayerSaju, TenGodResult

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

ELEMENT_KEY_BY_KOREAN = {
    "목": "wood",
    "화": "fire",
    "토": "earth",
    "금": "metal",
    "수": "water",
}


def _pillar_to_korean(pillar: str) -> str:
    return "".join(STEM_TO_KOREAN.get(char, BRANCH_TO_KOREAN.get(char, char)) for char in pillar)


def _stem_to_korean(stem: str) -> str:
    return STEM_TO_KOREAN[stem]


def _count_five_elements(saju_result: dict[str, str], include_hour: bool) -> dict[str, int]:
    counts = {element: 0 for element in ELEMENT_KEY_BY_KOREAN.values()}

    stems = [saju_result["year_stem"], saju_result["month_stem"], saju_result["day_stem"]]
    branches = [saju_result["year_branch"], saju_result["month_branch"], saju_result["day_branch"]]

    if include_hour:
        stems.append(saju_result["hour_stem"])
        branches.append(saju_result["hour_branch"])

    for stem in stems:
        counts[ELEMENT_KEY_BY_KOREAN[ELEMENT_BY_STEM[stem]]] += 1

    for branch in branches:
        counts[ELEMENT_KEY_BY_KOREAN[ELEMENT_BY_BRANCH[branch]]] += 1

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

STEM_INFO = {
    "갑": {"element": "목", "yin_yang": "양"},
    "을": {"element": "목", "yin_yang": "음"},
    "병": {"element": "화", "yin_yang": "양"},
    "정": {"element": "화", "yin_yang": "음"},
    "무": {"element": "토", "yin_yang": "양"},
    "기": {"element": "토", "yin_yang": "음"},
    "경": {"element": "금", "yin_yang": "양"},
    "신": {"element": "금", "yin_yang": "음"},
    "임": {"element": "수", "yin_yang": "양"},
    "계": {"element": "수", "yin_yang": "음"},
}

# 내가 생하는 오행
GENERATES = {
    "목": "화",
    "화": "토",
    "토": "금",
    "금": "수",
    "수": "목",
}

# 내가 극하는 오행
CONTROLS = {
    "목": "토",
    "토": "수",
    "수": "화",
    "화": "금",
    "금": "목",
}


TEN_GOD_KEYWORDS = {
    "비견": [
        "자기주도",
        "독립성",
        "승부욕",
        "자존심",
        "꾸준함",
    ],
    "겁재": [
        "경쟁심",
        "돌파력",
        "공격성",
        "과감함",
        "충동성",
    ],
    "식신": [
        "안정감",
        "꾸준한 생산성",
        "타격감",
        "집중력",
        "기술력",
    ],
    "상관": [
        "창의성",
        "폭발력",
        "변칙성",
        "감정기복",
        "돌발성",
    ],
    "편재": [
        "승부수",
        "모험성",
        "빠른 판단",
        "공격적 운영",
        "활동성",
    ],
    "정재": [
        "안정적 운영",
        "현실감각",
        "계산적 플레이",
        "꾸준함",
        "관리 능력",
    ],
    "편관": [
        "압박감",
        "강한 책임감",
        "투쟁심",
        "긴장감",
        "카리스마",
    ],
    "정관": [
        "규율",
        "안정성",
        "조직력",
        "침착함",
        "밸런스",
    ],
    "편인": [
        "직감",
        "변칙성",
        "아이디어",
        "예민함",
        "독창성",
    ],
    "정인": [
        "회복력",
        "보호",
        "안정감",
        "멘탈 유지",
        "학습능력",
    ],
}


def get_relation(day_master_element: str, target_element: str) -> str:
    if day_master_element == target_element:
        return "same"

    if GENERATES[day_master_element] == target_element:
        return "output"

    if CONTROLS[day_master_element] == target_element:
        return "wealth"

    if GENERATES[target_element] == day_master_element:
        return "resource"

    if CONTROLS[target_element] == day_master_element:
        return "officer"

    raise ValueError("알 수 없는 오행 관계")


def get_ten_god(day_master: str, target_stem: str) -> TenGodResult:
    dm = STEM_INFO[day_master]
    target = STEM_INFO[target_stem]

    relation = get_relation(
        dm["element"],
        target["element"]
    )

    same_yin_yang = dm["yin_yang"] == target["yin_yang"]

    ten_god = ""

    if relation == "same":
        ten_god = "비견" if same_yin_yang else "겁재"

    elif relation == "output":
        ten_god = "식신" if same_yin_yang else "상관"

    elif relation == "wealth":
        ten_god = "편재" if same_yin_yang else "정재"

    elif relation == "officer":
        ten_god = "편관" if same_yin_yang else "정관"

    elif relation == "resource":
        ten_god = "편인" if same_yin_yang else "정인"

    return TenGodResult(
        day_master=day_master,
        target_stem=target_stem,
        day_master_element=dm["element"],
        target_element=target["element"],
        relation=relation,
        ten_god=ten_god,
        keywords=TEN_GOD_KEYWORDS[ten_god],
    )
