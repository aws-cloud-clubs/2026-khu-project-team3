package com.sajuhomerun.backend_api.domain.game.dto;

import java.util.List;

public record TeamLuckyScoreRanking(
        Long id,
        String name,
        Integer luckyIndex,
        List<PlayerWithLuckyIndex> players
) {
}
