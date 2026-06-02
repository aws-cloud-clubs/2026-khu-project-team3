package com.sajuhomerun.backend_api.domain.game.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record GameInfo(
        Long id, LocalDate gameDate, LocalTime gameTime, String stadium
) {
}
