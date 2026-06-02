package com.sajuhomerun.backend_api.domain.player.dto;

import java.time.LocalDate;

public record ZodiacFortune(
        String zodiacSign,
        LocalDate fortuneDate,
        Integer rank,
        String fortuneText
) {
}
