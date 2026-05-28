import pytest

from src import saju


def test_get_player_saju_info_with_hour(monkeypatch):
    captured = {}

    def fake_calculate_saju(year: int, month: int, day: int, hour: int):
        captured["args"] = (year, month, day, hour)
        return {
            "year_pillar": "庚午",
            "month_pillar": "辛巳",
            "day_pillar": "庚辰",
            "hour_pillar": "辛巳",
            "day_stem": "庚",
            "year_stem": "庚",
            "month_stem": "辛",
            "hour_stem": "辛",
            "year_branch": "午",
            "month_branch": "巳",
            "day_branch": "辰",
            "hour_branch": "巳",
        }

    monkeypatch.setattr(saju, "calculate_saju", fake_calculate_saju)

    result = saju.get_player_saju_info("홍길동", 7, "1990", "05", "15", "09")

    assert captured["args"] == (1990, 5, 15, 9)
    assert result.name == "홍길동"
    assert result.player_id == 7
    assert result.year_pillar == "경오"
    assert result.month_pillar == "신사"
    assert result.day_pillar == "경진"
    assert result.hour_pillar == "신사"
    assert result.day_master == "경"
    assert result.five_elements == {"목": 0, "화": 3, "토": 1, "금": 4, "수": 0}


def test_get_player_saju_info_without_hour(monkeypatch):
    captured = {}

    def fake_calculate_saju(year: int, month: int, day: int, hour: int):
        captured["args"] = (year, month, day, hour)
        return {
            "year_pillar": "甲子",
            "month_pillar": "乙丑",
            "day_pillar": "丙寅",
            "hour_pillar": "丁卯",
            "day_stem": "丙",
            "year_stem": "甲",
            "month_stem": "乙",
            "hour_stem": "丁",
            "year_branch": "子",
            "month_branch": "丑",
            "day_branch": "寅",
            "hour_branch": "卯",
        }

    monkeypatch.setattr(saju, "calculate_saju", fake_calculate_saju)

    result = saju.get_player_saju_info("임꺽정", 3, "1988", "11", "01")

    assert captured["args"] == (1988, 11, 1, 12)
    assert result.hour_pillar is None
    assert result.day_master == "병"
    assert result.five_elements == {"목": 3, "화": 1, "토": 1, "금": 0, "수": 1}


def test_get_game_saju_info(monkeypatch):
    captured = {}

    def fake_calculate_saju(year: int, month: int, day: int, hour: int):
        captured["args"] = (year, month, day, hour)
        return {
            "day_stem": "丙",
            "day_branch": "申",
        }

    monkeypatch.setattr(saju, "calculate_saju", fake_calculate_saju)

    result = saju.get_game_saju_info("2025-05-27")

    assert captured["args"] == (2025, 5, 27, 12)
    assert result.game_date == "2025-05-27"
    assert result.day_stem == "병"
    assert result.day_branch == "신"


@pytest.mark.parametrize(
    ("day_master", "target_stem", "relation", "ten_god"),
    [
        ("갑", "갑", "same", "비견"),
        ("갑", "을", "same", "겁재"),
        ("갑", "병", "output", "식신"),
        ("갑", "정", "output", "상관"),
        ("갑", "무", "wealth", "편재"),
        ("갑", "기", "wealth", "정재"),
        ("갑", "경", "officer", "편관"),
        ("갑", "신", "officer", "정관"),
        ("갑", "임", "resource", "편인"),
        ("갑", "계", "resource", "정인"),
    ],
)
def test_get_ten_god(day_master, target_stem, relation, ten_god):
    result = saju.get_ten_god(day_master, target_stem)

    assert result.day_master == day_master
    assert result.target_stem == target_stem
    assert result.relation == relation
    assert result.ten_god == ten_god
    assert result.day_master_element == saju.STEM_INFO[day_master]["element"]
    assert result.target_element == saju.STEM_INFO[target_stem]["element"]
    assert result.keywords == saju.TEN_GOD_KEYWORDS[ten_god]
