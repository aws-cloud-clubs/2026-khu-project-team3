package com.sajuhomerun.backend_api.domain.game;

import com.sajuhomerun.backend_api.domain.game.dto.GamePageDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/saju/games")
@RequiredArgsConstructor
public class GameController {
    private final GameService gameService;

    @GetMapping("/{gameId}")
    public GamePageDetailResponse gamePageDetailResponse(
            @PathVariable Long gameId
    ){
        return gameService.gamePageDetailResponse(gameId);
    }
}
