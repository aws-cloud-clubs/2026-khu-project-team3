package com.sajuhomerun.backend_api.domain.game.dto;

public record GamePageDetailResponse(
        GameInfo game,
        TeamLuckyScoreRanking homeTeam,
        TeamLuckyScoreRanking awayTeam
) {}
