package com.sajuhomerun.backend_api.domain.game.dto;

import java.util.List;

public record TodayGamesResponse(List<TodayGameItem> todayGames) {
}
