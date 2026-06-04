package com.sajuhomerun.backend_api.domain.team.dto;

import com.sajuhomerun.backend_api.domain.player.dto.TeamInfo;

public record TeamRankingItem(Integer rank, TeamInfo team) {
}
