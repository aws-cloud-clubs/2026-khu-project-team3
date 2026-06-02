package com.sajuhomerun.backend_api.domain.player;

import com.sajuhomerun.backend_api.common.ServiceDateProvider;
import com.sajuhomerun.backend_api.domain.player.dto.PlayerDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/saju/players")
@RequiredArgsConstructor
public class PlayerController {
    private final PlayerService playerService;
    private final ServiceDateProvider serviceDateProvider;

    @GetMapping("/{playerId}")
    public PlayerDetailResponse getPlayerDetail(@PathVariable Long playerId){
        return playerService.getPlayerDetail(playerId, serviceDateProvider.today());
    }
}
