package com.sajuhomerun.backend_api.domain.game;

import com.sajuhomerun.backend_api.common.ServiceDateProvider;
import com.sajuhomerun.backend_api.domain.game.dto.GamePageDetailResponse;
import com.sajuhomerun.backend_api.domain.game.dto.TodayGamesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/saju/games")
@RequiredArgsConstructor
public class GameController {
    private final GameService gameService;
    private final ServiceDateProvider serviceDateProvider;

    @GetMapping("/today")
    public TodayGamesResponse getTodayGames() {
        return gameService.getTodayGames(serviceDateProvider.today());
    }

    @GetMapping("/{gameId}")
    public GamePageDetailResponse gamePageDetailResponse(
            @PathVariable Long gameId
    ){
        return gameService.gamePageDetailResponse(gameId);
    }
}
