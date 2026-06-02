package com.sajuhomerun.backend_api.domain.player;

import com.sajuhomerun.backend_api.domain.player.dto.PlayerDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/saju/players")
@RequiredArgsConstructor
public class PlayerController {
    private final PlayerService playerService;

    @GetMapping("/{playerId}")
    public PlayerDetailResponse getPlayerDetail(@PathVariable Long playerId){
        String dateStr = "2026-06-02";
        LocalDate localDate = LocalDate.parse(dateStr);
        return playerService.getPlayerDetail(playerId, localDate);
    }
}
