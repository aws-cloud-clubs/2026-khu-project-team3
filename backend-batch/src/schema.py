from pydantic import BaseModel


class GameSchedule(BaseModel):
    away_team: str
    home_team: str
    game_date: str
    game_time: str
    stadium: str


class PlayerSaju(BaseModel):
    name: str
    player_id: int
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str | None = None
    day_master: str
    five_elements: dict[str, int]  # 오행 분포 정보 예: {"목": 3, "화": 2, "토": 1, "금": 0, "수": 0}


class PlayerGameSaju(BaseModel):
    name: str
    player_id: int
    day_master: str


class GameSaju(BaseModel):
    game_date: str
    day_stem: str
    day_branch: str


class SQSMessage(BaseModel):
    game_saju: GameSaju
    player_saju: PlayerGameSaju
    
