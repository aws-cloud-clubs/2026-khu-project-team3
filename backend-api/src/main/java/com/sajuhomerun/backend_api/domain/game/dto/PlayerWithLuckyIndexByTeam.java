package com.sajuhomerun.backend_api.domain.game.dto;

public record PlayerWithLuckyIndexByTeam(
        Long teamId,
        Long id,
        String name,
        String position,
        Integer luckyIndex,
        String profileImageUrl
) {
    public PlayerWithLuckyIndex toPlayerWithLuckyIndex() {
        return new PlayerWithLuckyIndex(id, name, position, luckyIndex, profileImageUrl);
    }
}
