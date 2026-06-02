CREATE TABLE teams ( -- 팀 테이블
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,

    -- 최신 팀 순위
    ranking INTEGER,

    -- 순위 기준일
    ranking_base_date DATE
);

CREATE OR REPLACE FUNCTION zodiac_sign_from_birth_date(input_date DATE)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT CASE
        WHEN (EXTRACT(MONTH FROM input_date) = 3 AND EXTRACT(DAY FROM input_date) >= 21)
          OR (EXTRACT(MONTH FROM input_date) = 4 AND EXTRACT(DAY FROM input_date) <= 19) THEN 'ARIES'
        WHEN (EXTRACT(MONTH FROM input_date) = 4 AND EXTRACT(DAY FROM input_date) >= 20)
          OR (EXTRACT(MONTH FROM input_date) = 5 AND EXTRACT(DAY FROM input_date) <= 20) THEN 'TAURUS'
        WHEN (EXTRACT(MONTH FROM input_date) = 5 AND EXTRACT(DAY FROM input_date) >= 21)
          OR (EXTRACT(MONTH FROM input_date) = 6 AND EXTRACT(DAY FROM input_date) <= 21) THEN 'GEMINI'
        WHEN (EXTRACT(MONTH FROM input_date) = 6 AND EXTRACT(DAY FROM input_date) >= 22)
          OR (EXTRACT(MONTH FROM input_date) = 7 AND EXTRACT(DAY FROM input_date) <= 22) THEN 'CANCER'
        WHEN (EXTRACT(MONTH FROM input_date) = 7 AND EXTRACT(DAY FROM input_date) >= 23)
          OR (EXTRACT(MONTH FROM input_date) = 8 AND EXTRACT(DAY FROM input_date) <= 22) THEN 'LEO'
        WHEN (EXTRACT(MONTH FROM input_date) = 8 AND EXTRACT(DAY FROM input_date) >= 23)
          OR (EXTRACT(MONTH FROM input_date) = 9 AND EXTRACT(DAY FROM input_date) <= 23) THEN 'VIRGO'
        WHEN (EXTRACT(MONTH FROM input_date) = 9 AND EXTRACT(DAY FROM input_date) >= 24)
          OR (EXTRACT(MONTH FROM input_date) = 10 AND EXTRACT(DAY FROM input_date) <= 22) THEN 'LIBRA'
        WHEN (EXTRACT(MONTH FROM input_date) = 10 AND EXTRACT(DAY FROM input_date) >= 23)
          OR (EXTRACT(MONTH FROM input_date) = 11 AND EXTRACT(DAY FROM input_date) <= 22) THEN 'SCORPIO'
        WHEN (EXTRACT(MONTH FROM input_date) = 11 AND EXTRACT(DAY FROM input_date) >= 23)
          OR (EXTRACT(MONTH FROM input_date) = 12 AND EXTRACT(DAY FROM input_date) <= 24) THEN 'SAGITTARIUS'
        WHEN (EXTRACT(MONTH FROM input_date) = 12 AND EXTRACT(DAY FROM input_date) >= 25)
          OR (EXTRACT(MONTH FROM input_date) = 1 AND EXTRACT(DAY FROM input_date) <= 19) THEN 'CAPRICORN'
        WHEN (EXTRACT(MONTH FROM input_date) = 1 AND EXTRACT(DAY FROM input_date) >= 20)
          OR (EXTRACT(MONTH FROM input_date) = 2 AND EXTRACT(DAY FROM input_date) <= 18) THEN 'AQUARIUS'
        ELSE 'PISCES'
    END
$$;

CREATE TYPE report_status AS ENUM (
    'PENDING',
    'GENERATING',
    'GENERATED',
    'FAILED'
);

CREATE TABLE players ( -- 선수 테이블
    id BIGSERIAL PRIMARY KEY,

    -- 소속 팀
    team_id BIGINT NOT NULL
        REFERENCES teams(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    -- 포지션
    position TEXT NULL,

    -- 생년월일
    birth_date DATE NOT NULL,

    -- 생년월일 기준 자동 계산 별자리
    zodiac_sign TEXT GENERATED ALWAYS AS (zodiac_sign_from_birth_date(birth_date)) STORED,

    -- 출생 시간 (없을 수 있음)
    birth_time TIME NULL,

    created_at TIMESTAMP DEFAULT now(),

    CHECK (
        zodiac_sign IN (
            'ARIES',
            'TAURUS',
            'GEMINI',
            'CANCER',
            'LEO',
            'VIRGO',
            'LIBRA',
            'SCORPIO',
            'SAGITTARIUS',
            'CAPRICORN',
            'AQUARIUS',
            'PISCES'
        )
    )
);

CREATE TABLE player_saju ( -- 각 선수의 고정 사주 정보 테이블
    -- players 와 1:1 관계
    player_id BIGINT PRIMARY KEY
        REFERENCES players(id)
        ON DELETE CASCADE,

    -- 사주 기둥 정보
    year_pillar VARCHAR(10) NOT NULL,   -- 년주(年柱)
    month_pillar VARCHAR(10) NOT NULL,  -- 월주(月柱)
    day_pillar VARCHAR(10) NOT NULL,    -- 일주(日柱)
    hour_pillar VARCHAR(10),            -- 시주(時柱), 출생시간 없으면 NULL

    -- 일간(日干)
    day_master VARCHAR(10) NOT NULL,

    -- 오행(木火土金水) 분포 정보
    five_elements JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE games ( -- 경기 정보 테이블
    id BIGSERIAL PRIMARY KEY,

    -- 경기 날짜
    game_date DATE NOT NULL,

    -- 경기 시작 시간
    game_time TIME NULL,

    -- 홈팀
    home_team_id BIGINT NOT NULL
        REFERENCES teams(id)
        ON DELETE RESTRICT,

    -- 원정팀
    away_team_id BIGINT NOT NULL
        REFERENCES teams(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMP DEFAULT now(),

    -- 같은 날짜 동일 경기 중복 방지
    UNIQUE (game_date, home_team_id, away_team_id)
);

CREATE TABLE daily_saju_report ( -- 선수별 경기일 운세 결과 테이블
    id BIGSERIAL PRIMARY KEY,

    -- 대상 선수
    player_id BIGINT NOT NULL
        REFERENCES players(id)
        ON DELETE CASCADE,

    -- 경기 날짜
    game_date DATE NOT NULL,

    -- 경기일 천간(天干)
    game_day_stem VARCHAR(10),

    -- 경기일 지지(地支)
    game_day_branch VARCHAR(10),

    -- 오행(五行) 상호작용 정보
    five_element_interaction JSONB,

    -- 십성(十星) 상호작용 정보
    ten_god_interaction JSONB,

    -- LLM이 생성한 운세 정보
    report_text TEXT,

    -- LLM이 생성한 행운 지수 (0~100)
    lucky_index INTEGER,

    -- 생성 상태
    -- PENDING: 생성 대기
    -- GENERATING: 생성 중
    -- GENERATED: 생성 완료
    -- FAILED: 생성 실패
    status report_status NOT NULL DEFAULT 'PENDING',

    -- 프롬프트 버전
    prompt_version VARCHAR(20) NOT NULL,

    -- 재시도 횟수
    attempt_count INTEGER NOT NULL DEFAULT 0,

    -- 실패 시 에러 메시지
    error_message TEXT,

    -- 실제 생성 완료 시각
    generated_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),

    -- 결국 선수 + 경기일 기준으로 운세 1개
    UNIQUE (player_id, game_date),

    CHECK (
        status IN (
            'PENDING',
            'GENERATING',
            'GENERATED',
            'FAILED'
        )
    ),
    CHECK (lucky_index IS NULL OR lucky_index BETWEEN 0 AND 100)
);

CREATE TABLE zodiac_fortune_rankings ( -- 별자리별 최신 운세 순위 테이블
    -- 별자리
    zodiac_sign VARCHAR(20) PRIMARY KEY,

    -- 운세 기준 날짜
    fortune_date DATE NOT NULL,

    -- 별자리 순위 (1~12)
    rank INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),

    CHECK (
        zodiac_sign IN (
            'ARIES',
            'TAURUS',
            'GEMINI',
            'CANCER',
            'LEO',
            'VIRGO',
            'LIBRA',
            'SCORPIO',
            'SAGITTARIUS',
            'CAPRICORN',
            'AQUARIUS',
            'PISCES'
        )
    ),
    CHECK (rank BETWEEN 1 AND 12)
);

-- 특정 팀 선수 조회
CREATE INDEX idx_players_team_id
ON players(team_id);

-- 특정 별자리 선수 조회
CREATE INDEX idx_players_zodiac_sign
ON players(zodiac_sign);

-- 특정 날짜 경기 조회
CREATE INDEX idx_games_game_date
ON games(game_date);

-- 홈팀 기준 조회
CREATE INDEX idx_games_home_team_id
ON games(home_team_id);

-- 원정팀 기준 조회
CREATE INDEX idx_games_away_team_id
ON games(away_team_id);

-- 특정 날짜 운세 조회
CREATE INDEX idx_daily_saju_report_game_date
ON daily_saju_report(game_date);

-- 특정 선수 운세 조회
CREATE INDEX idx_daily_saju_report_player_id
ON daily_saju_report(player_id);

-- 상태 기반 작업 조회
CREATE INDEX idx_daily_saju_report_status
ON daily_saju_report(status);

-- 날짜별 별자리 운세 조회
CREATE INDEX idx_zodiac_fortune_rankings_fortune_date
ON zodiac_fortune_rankings(fortune_date);
