1. 구단 랭킹 조회 : GET /api/v1/saju/teams/ranking API를 통해 구단별 사주 기반 랭킹 정보를 조회할 수 있습니다.
Response 200:
{
  "kbo_rankings": [
    {
      "rank": 1,
      "team": {
        "id": 1,
        "name": "KIA",
        "logo_url": "https://..."
      }
    }
  ]
}

2. 당일 경기 목록 조회 : GET /api/v1/saju/games/today API를 통해 오늘 진행 예정인 경기 목록을 조회할 수 있습니다.
Response 200:
{
  "today_games": [
    {
      "game_id": 101,
      "game_date": "2026-05-31",
      "game_time": "18:30",
      "stadium": "잠실구장",
      "home_team": {
        "id": 2,
        "name": "두산",
        "logo_url": "https://...",
        "lucky_index": 79
      },
      "away_team": {
        "id": 8,
        "name": "한화",
        "logo_url": "https://...",
        "lucky_index": 79
      }
    }
  ]
}

3. 선수 한명 사주 분석 조회 : GET 
/api/v1/saju/players/{player_id} API를 통해 특정 선수의 고유 ID(player_id)를 기준으로 사주 분석 결과를 조회할 수 있습니다.
Response:
{
  "player": {
    "id": 1001,
    "name": "정은원",
    "team": {
      "id": 1,
      "name": "한화 이글스",
      "logo_url": "https://cdn.example.com/teams/hanwha.png"
    },
    "position": "2루수",
    "profile_image_url": "https://cdn.example.com/players/1001.png"
  },


  "daily_fortune": {
    "lucky_index": 84,

    "fortune_text": "오늘은 경기 흐름을 바꿀 수 있는 장면이 나올 가능성이 있어 보입니다. 중요한 순간 존재감이 커질 수 있는 흐름이 들어와 있으며 공격적인 플레이가 분위기를 끌어올릴 수 있습니다. 전체적으로 좋은 흐름이 기대되는 경기입니다.",

    "generated_at": "2026-05-28T09:00:00Z"
  },

  "zodiac_fortune": {
    "zodiac_sign": "사자",
    "rank": 2,
    "fortune_date": "2026-06-02"
    "fortune_text": "주변의 기대가 자연스럽게 모이는 하루입니다. 자신감 있는 선택이 좋은 흐름으로 이어질 가능성이 있습니다."
  }
}

# Toggle

선수 기본 정보

| Field | Type | Description |
| --- | --- | --- |
| id | integer | 선수 ID |
| name | string | 선수명 |
| team | Team | 소속 구단 |
| position | string | 포지션 |
| profile_image_url | string | null | 선수 프로필 이미지 |

오늘 경기 정보

| Field | Type | Description |
| --- | --- | --- |
| game_id | integer | 경기 ID |
| game_date | string(date) | 경기 날짜 |
| game_time | string(time) | 경기 시작 시간 |
| stadium | string | 경기장 |

경기일 기준 선수 운세 정보

| Field | Type | Description |
| --- | --- | --- |
| lucky_index | integer | 행운 지수 (0~100) |
| rank_in_today_players | integer | 오늘 경기 선수 전체 기준 행운 지수 순위 |
| fortune_text | string | 경기일 기준 사주팔자 프리뷰 문장 |
| generated_at | string(datetime) | 생성 시각 |

오하아사 별자리 운세 정보

| Field | Type | Description |
| --- | --- | --- |
| zodiac_sign | string | 선수 별자리 |
| rank | integer | 오하아사 별자리 순위 (1~12) |
| fortune_text | string | 해당 별자리 운세 멘트 |

4. 경기 페이지 조회 : GET /api/v1/saju/games/{game_id} API를 통해 특정 경기의 고유 ID(game_id)를 기준으로 경기 상세 정보와 사주 분석 결과를 조회할 수 있습니다.
Response:
{
  "game": {
    "id": 101,
    "game_date": "2026-05-28",
    "game_time": "18:30",
    "stadium": "대전 한화생명이글스파크"
  },


  "home_team": {
    "id": 1,
    "name": "한화 이글스",
    "logo_url": "https://cdn.example.com/teams/hanwha.png",
    "lucky_index": 78,

    "players": [
      {
        "id": 1001,
        "name": "정은원",
        "position": "2루수",
        "profile_image_url": "https://cdn.example.com/players/1001.png",
        "lucky_index": 84
      },
      {
        "id": 1002,
        "name": "최재훈",
        "position": "포수",
        "profile_image_url": "https://cdn.example.com/players/1002.png",
        "lucky_index": 72
      }
    ]
  },

  "away_team": {
    "id": 7,
    "name": "롯데 자이언츠",
    "logo_url": "https://cdn.example.com/teams/lotte.png",
    "ranking": 5,
    "lucky_index": 64,

    "players": [
      {
        "id": 2001,
        "name": "전준우",
        "position": "좌익수",
        "profile_image_url": "https://cdn.example.com/players/2001.png",
        "lucky_index": 69
      }
    ]
  }
}