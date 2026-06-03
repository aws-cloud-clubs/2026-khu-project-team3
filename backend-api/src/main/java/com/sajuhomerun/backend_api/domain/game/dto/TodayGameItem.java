package com.sajuhomerun.backend_api.domain.game.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record TodayGameItem(
        Long gameId,
        LocalDate gameDate,
        LocalTime gameTime,
        String stadium,
        GameTeamInfo homeTeam,
        GameTeamInfo awayTeam
) {
}
