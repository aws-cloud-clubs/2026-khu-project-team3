package com.sajuhomerun.backend_api.domain.game.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record PlayerWithLuckyIndex (
       Long id,
       String name,
       String position,
       Integer luckyIndex,
       String profileImageUrl
){}
