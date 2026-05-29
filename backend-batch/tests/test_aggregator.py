from src.aggregator import _get_ten_god_interaction
from src.schema import GameSaju, PlayerGameSaju


def test_get_ten_god_interaction_returns_jsonb_payload_fields():
    player = PlayerGameSaju(player_id=1, name="홍길동", day_master="갑")
    game_saju = GameSaju(game_date="2026-05-28", day_stem="경", day_branch="인")

    result = _get_ten_god_interaction(player, game_saju)

    assert result == {
        "relation": "officer",
        "ten_god": "편관",
        "keywords": ["압박감", "강한 책임감", "투쟁심", "긴장감", "카리스마"],
    }
