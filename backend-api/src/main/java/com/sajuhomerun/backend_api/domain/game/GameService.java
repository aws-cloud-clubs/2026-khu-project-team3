package com.sajuhomerun.backend_api.domain.game;

import com.sajuhomerun.backend_api.domain.game.dto.GameInfo;
import com.sajuhomerun.backend_api.domain.game.dto.GamePageDetailResponse;
import com.sajuhomerun.backend_api.domain.game.dto.PlayerWithLuckyIndex;
import com.sajuhomerun.backend_api.domain.game.dto.TeamLuckyScoreRanking;
import com.sajuhomerun.backend_api.domain.player.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;


    public GamePageDetailResponse gamePageDetailResponse(Long gameId){
        Game game = gameRepository.findGameByIdWithTeams(gameId).orElseThrow(
                () -> new IllegalArgumentException("존재하지 않는 경기")
        );

        List<PlayerWithLuckyIndex> homeTeamPlayer = playerRepository.findPlayersWithLuckyIndexByGameDateAndTeam(
                game.getGameDate(),
                game.getHomeTeam().getId()
        );

        int homeTeamAvgLuckyIndex = ((int) homeTeamPlayer
                .stream()
                .map(PlayerWithLuckyIndex::luckyIndex)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average().orElse(0.0));

        List<PlayerWithLuckyIndex> awayTeamPlayer = playerRepository.findPlayersWithLuckyIndexByGameDateAndTeam(
                game.getGameDate(),
                game.getAwayTeam().getId()
        );

        int awayTeamAvgLuckyIndex = ((int) awayTeamPlayer
                .stream()
                .map(PlayerWithLuckyIndex::luckyIndex)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average().orElse(0.0));

        return new GamePageDetailResponse(
                new GameInfo(
                        game.getId(), game.getGameDate(), game.getGameTime(), game.getStadium()
                ),
                new TeamLuckyScoreRanking(
                    game.getHomeTeam().getId(), game.getHomeTeam().getName(), homeTeamAvgLuckyIndex, homeTeamPlayer, game.getHomeTeam().getLogoImagePath()),
                new TeamLuckyScoreRanking(
                    game.getAwayTeam().getId(), game.getAwayTeam().getName(), awayTeamAvgLuckyIndex, awayTeamPlayer, game.getAwayTeam().getLogoImagePath())
        );
    }
}
