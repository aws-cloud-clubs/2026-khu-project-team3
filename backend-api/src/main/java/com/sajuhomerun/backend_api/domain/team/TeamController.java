package com.sajuhomerun.backend_api.domain.team;

import com.sajuhomerun.backend_api.domain.team.dto.KboRankingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/saju/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @GetMapping("/ranking")
    public KboRankingResponse getRanking() {
        return teamService.getKboRankings();
    }
}
