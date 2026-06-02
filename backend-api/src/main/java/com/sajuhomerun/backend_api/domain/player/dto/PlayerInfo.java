package com.sajuhomerun.backend_api.domain.player.dto;

public record PlayerInfo(
        Long id,
        String name,
        TeamInfo team,
        String position
) {
}
