package com.sajuhomerun.backend_api.domain.player.dto;

public record ZodiacFortune(
        String zodiacSign,
        Integer rank,
        String fortuneText
) {
}
