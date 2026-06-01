from pydantic import BaseModel


class GameSchedule(BaseModel):
    away_team: str
    home_team: str
    game_date: str
    game_time: str
    stadium: str


class TeamRanking(BaseModel):
    team: str
    ranking: int


class PlayerSaju(BaseModel):
    name: str
    player_id: int
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str | None = None
    day_master: str
    five_elements: dict[str, int]  # 오행 분포 정보 예: {"wood": 3, "fire": 2, "earth": 1, "metal": 0, "water": 0}


class PlayerGameSaju(BaseModel):
    name: str
    player_id: int
    day_master: str


class GameSaju(BaseModel):
    game_date: str
    day_stem: str
    day_branch: str


class TenGodResult(BaseModel):
    day_master: str
    target_stem: str
    day_master_element: str
    target_element: str
    relation: str
    ten_god: str
    keywords: list[str]


class SQSMessage(BaseModel):
    player_id: int
    game_date: str
    ten_god_result: TenGodResult

class LLMOutput(BaseModel):
    lucky_index: int # 행운지수
    saju_text: str
    
