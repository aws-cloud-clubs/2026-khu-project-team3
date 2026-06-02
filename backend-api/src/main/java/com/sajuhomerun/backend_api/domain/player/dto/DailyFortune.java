package com.sajuhomerun.backend_api.domain.player.dto;

import java.time.LocalDateTime;

public record DailyFortune(
        Integer luckyIndex,
        String fortuneText,
        LocalDateTime generatedAt
) {
}
