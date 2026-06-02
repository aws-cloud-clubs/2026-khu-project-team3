package com.sajuhomerun.backend_api.domain.player.dto;

public record PlayerDetailResponse (
    PlayerInfo player,
    DailyFortune dailyFortune,
    ZodiacFortune zodiacFortune
){ }
