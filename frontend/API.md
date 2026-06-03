癤?. main_home.html: /api/v1/saju/teams/ranking

### GET /api/home

???遺얇늺???袁⑹뒄???類ｋ궖??鈺곌퀬???몃빍??

### Response 200

```json
{
  "today_games": [
    {
      "game_id": 101,
      "game_date": "2026-05-31",
      "game_time": "18:30",
      "stadium": "?醫롫뼄?닌딆삢",
      "home_team": {
        "id": 2,
        "name": "?癒?텦",
        "logo_url": "https://..."
      },
      "away_team": {
        "id": 8,
        "name": "??쀬넅",
        "logo_url": "https://..."
      }
    }
  ],

  "team_luck_rankings": [
    {
      "rank": 1,
      "team": {
        "id": 6,
        "name": "SSG",
        "logo_url": "https://..."
      },
      "luck_score": 79
    }
  ],

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
```

### Schema

### Team

| Field | Type | Description |
| --- | --- | --- |
| id | integer | ?? ID |
| name | string | ??筌?|
| logo_url | string | ?? 嚥≪뮄??URL |

### TeamLuckRanking

| Field | Type |
| --- | --- |
| rank | integer |
| team | Team |
| luck_score | integer |

### Game

| Field | Type |
| --- | --- |
| game_id | integer |
| game_date | string(date) |
| game_time | string(time) |
| stadium | string |
| home_team | Team |
| away_team | Team |

### HomeResponse

| Field | Type |
| --- | --- |
| today_games | Game[] |
| team_luck_rankings | TeamLuckRanking[] |
| kbo_rankings | KboRanking[] |

2. player_lineup.html: /api/v1/saju/games/{game_id}

## Response

```json
{
  "game": {
    "id": 101,
    "game_date": "2026-05-28",
    "game_time": "18:30",
    "stadium": "??????쀬넅??몄구?????쎈솁??
  },

  "summary": {
    "team_luck_score": 78,
    "message": "??삳뮎 ??쀬넅 ?????쇱벥 ??깆뒲 筌왖??롫뮉 78?癒?뿯??덈뼄. ?醫롫땾 ??已????鍮?揶쏆뮇????곴쉭???類ㅼ뵥????紐꾩뒄."
  },

  "home_team": {
    "id": 1,
    "name": "??쀬넅 ?????,
    "logo_url": "https://cdn.example.com/teams/hanwha.png",
    "ranking": 8,
    "luck_score": 78,

    "players": [
      {
        "id": 1001,
        "name": "?類???,
        "position": "2?룐뫁??,
        "profile_image_url": "https://cdn.example.com/players/1001.png",
        "lucky_index": 84
      },
      {
        "id": 1002,
        "name": "筌ㅼ뮇???,
        "position": "????,
        "profile_image_url": "https://cdn.example.com/players/1002.png",
        "lucky_index": 72
      }
    ]
  },

  "away_team": {
    "id": 7,
    "name": "嚥????癒?뵠?紐꾪닶",
    "logo_url": "https://cdn.example.com/teams/lotte.png",
    "ranking": 5,
    "luck_score": 64,

    "players": [
      {
        "id": 2001,
        "name": "?袁???,
        "position": "?ル슣???,
        "profile_image_url": "https://cdn.example.com/players/2001.png",
        "lucky_index": 69
      }
    ]
  }
}
```

---

## Field Description

### game

| Field | Type | Description |
| --- | --- | --- |
| id | integer | 野껋럡由?ID |
| game_date | string(date) | 野껋럡由??醫롮? |
| game_time | string(time) | 野껋럡由???뽰삂 ??볦퍢 |
| stadium | string | 野껋럡由??|

### summary

| Field | Type | Description |
| --- | --- | --- |
| team_luck_score | integer | ??? 疫꿸퀣? ??깆뒲 筌왖??|
| message | string | ?怨룸뼊 ??덇땀 ?얜㈇??|

### home_team / away_team

| Field | Type | Description |
| --- | --- | --- |
| id | integer | ?? ID |
| name | string | ??筌?|
| logo_url | string | ?? 嚥≪뮄?????筌왖 URL |
| ranking | integer | ?袁⑹삺 KBO ??뽰맄 |
| luck_score | integer | ?? ??깆뒲 筌왖??|
| players | Player[] | ?醫롫땾 筌뤴뫖以?|

### Player

| Field | Type | Description |
| --- | --- | --- |
| id | integer | ?醫롫땾 ID |
| name | string | ?醫롫땾筌?|
| position | string | ?????|
| profile_image_url | string | null | ?袁⑥쨮?????筌왖 URL |
| lucky_index | integer | ?醫롫땾 ??깆뒲 筌왖??(0~100) |

3. player_fortune.html: /api/v1/saju/players/{player_id}

## Response

```json
{
  "player": {
    "id": 1001,
    "name": "?類???,
    "team": {
      "id": 1,
      "name": "??쀬넅 ?????,
      "logo_url": "https://cdn.example.com/teams/hanwha.png"
    },
    "position": "2?룐뫁??,
    "profile_image_url": "https://cdn.example.com/players/1001.png"
  },

  "today_game": {
    "game_id": 101,
    "game_date": "2026-05-28",
    "game_time": "18:30",
    "stadium": "??????쀬넅??몄구?????쎈솁??
  },

  "daily_fortune": {
    "lucky_index": 84,
    "rank_in_today_players": 3,

    "fortune_text": "??삳뮎?? 野껋럡由??癒?カ??獄쏅떽? ????덈뮉 ?貫?????륁궞 揶쎛?關苑????됰선 癰귣똻???덈뼄. 餓λ쵐?????볦퍢 鈺곕똻?긷첎癒?뵠 ?뚣끉彛?????덈뮉 ?癒?カ????쇰선?? ??됱몵筌??⑤벀爰?怨몄뵥 ???쟿??? ?브쑴?욄묾怨? ???선????????됰뮸??덈뼄. ?袁⑷퍥?怨몄몵嚥??ル뿭? ?癒?カ??疫꿸퀡???롫뮉 野껋럡由??낅빍??",

    "generated_at": "2026-05-28T09:00:00Z"
  },

  "zodiac_fortune": {
    "zodiac_sign": "????,
    "rank": 2,

    "fortune_text": "雅뚯눖???疫꿸퀡?揶쎛 ?癒?염??살쓦野?筌뤴뫁?????롳펷??낅빍?? ?癒?뻿揶???덈뮉 ?醫뤾문???ル뿭? ?癒?カ??곗쨮 ??곷선筌?揶쎛?關苑????됰뮸??덈뼄."
  }
}
```

---

# Toggle

?醫롫땾 疫꿸퀡???類ｋ궖

| Field | Type | Description |
| --- | --- | --- |
| id | integer | ?醫롫땾 ID |
| name | string | ?醫롫땾筌?|
| team | Team | ???꺗 ?닌됰뼊 |
| position | string | ?????|
| profile_image_url | string | null | ?醫롫땾 ?袁⑥쨮?????筌왖 |

??삳뮎 野껋럡由??類ｋ궖

| Field | Type | Description |
| --- | --- | --- |
| game_id | integer | 野껋럡由?ID |
| game_date | string(date) | 野껋럡由??醫롮? |
| game_time | string(time) | 野껋럡由???뽰삂 ??볦퍢 |
| stadium | string | 野껋럡由??|

野껋럡由??疫꿸퀣? ?醫롫땾 ??곴쉭 ?類ｋ궖

| Field | Type | Description |
| --- | --- | --- |
| lucky_index | integer | ??깆뒲 筌왖??(0~100) |
| rank_in_today_players | integer | ??삳뮎 野껋럡由??醫롫땾 ?袁⑷퍥 疫꿸퀣? ??깆뒲 筌왖????뽰맄 |
| fortune_text | string | 野껋럡由??疫꿸퀣? ??竊?遺우쁽 ?袁ⓥ봺???얜챷??|
| generated_at | string(datetime) | ??밴쉐 ??볦퍟 |

??쎈릭?袁⑷텢 癰귢쑴?꾤뵳???곴쉭 ?類ｋ궖

| Field | Type | Description |
| --- | --- | --- |
| zodiac_sign | string | ?醫롫땾 癰귢쑴?꾤뵳?|
| rank | integer | ??쎈릭?袁⑷텢 癰귢쑴?꾤뵳???뽰맄 (1~12) |
| fortune_text | string | ????癰귢쑴?꾤뵳???곴쉭 筌롮꼹??|
