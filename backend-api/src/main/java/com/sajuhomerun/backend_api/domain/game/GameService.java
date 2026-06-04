package com.sajuhomerun.backend_api.domain.game;

import com.sajuhomerun.backend_api.domain.game.dto.*;
import com.sajuhomerun.backend_api.domain.player.PlayerRepository;
import com.sajuhomerun.backend_api.domain.team.Team;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GameService {
    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;


    public GamePageDetailResponse gamePageDetailResponse(Long gameId){
        log.info("Loading game detail. gameId={}", gameId);

        Game game = gameRepository.findGameByIdWithTeams(gameId).orElseThrow(() -> {
            log.error("Game not found. gameId={}", gameId);
            return new IllegalArgumentException("존재하지 않는 경기");
        });

        log.debug(
                "Game found. gameId={}, gameDate={}, homeTeamId={}, awayTeamId={}",
                game.getId(),
                game.getGameDate(),
                game.getHomeTeam().getId(),
                game.getAwayTeam().getId()
        );

        List<PlayerWithLuckyIndex> homeTeamPlayer = playerRepository.findPlayersWithLuckyIndexByGameDateAndTeam(
                game.getGameDate(),
                game.getHomeTeam().getId()
        );

        if (homeTeamPlayer.isEmpty()) {
            log.warn(
                    "No lucky index players found for home team. gameId={}, teamId={}, gameDate={}",
                    game.getId(),
                    game.getHomeTeam().getId(),
                    game.getGameDate()
            );
        }

        int homeTeamAvgLuckyIndex = calcAvgLuckyIndex(homeTeamPlayer);

        List<PlayerWithLuckyIndex> awayTeamPlayer = playerRepository.findPlayersWithLuckyIndexByGameDateAndTeam(
                game.getGameDate(),
                game.getAwayTeam().getId()
        );

        if (awayTeamPlayer.isEmpty()) {
            log.warn(
                    "No lucky index players found for away team. gameId={}, teamId={}, gameDate={}",
                    game.getId(),
                    game.getAwayTeam().getId(),
                    game.getGameDate()
            );
        }

        int awayTeamAvgLuckyIndex = calcAvgLuckyIndex(awayTeamPlayer);

        log.debug(
                "Calculated team lucky index averages. gameId={}, homeAvg={}, awayAvg={}, homePlayerCount={}, awayPlayerCount={}",
                game.getId(),
                homeTeamAvgLuckyIndex,
                awayTeamAvgLuckyIndex,
                homeTeamPlayer.size(),
                awayTeamPlayer.size()
        );

        log.info("Loaded game detail. gameId={}", game.getId());

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

    public TodayGamesResponse getTodayGames(LocalDate today) {
        log.info("Loading today games. date={}", today);

        List<Game> games = gameRepository.findGamesByGameDateWithTeams(today);
        log.debug("Today games found. date={}, count={}", today, games.size());

        List<TodayGameItem> items = games.stream().map(game -> {
            int homeLuckyIndex = calcAvgLuckyIndex(
                    playerRepository.findPlayersWithLuckyIndexByGameDateAndTeam(today, game.getHomeTeam().getId())
            );
            int awayLuckyIndex = calcAvgLuckyIndex(
                    playerRepository.findPlayersWithLuckyIndexByGameDateAndTeam(today, game.getAwayTeam().getId())
            );
            return new TodayGameItem(
                    game.getId(),
                    game.getGameDate(),
                    game.getGameTime(),
                    game.getStadium(),
                    toGameTeamInfo(game.getHomeTeam(), homeLuckyIndex),
                    toGameTeamInfo(game.getAwayTeam(), awayLuckyIndex)
            );
        }).toList();

        log.info("Loaded today games. date={}, count={}", today, items.size());
        return new TodayGamesResponse(items);
    }

    private GameTeamInfo toGameTeamInfo(Team team, int luckyIndex) {
        return new GameTeamInfo(team.getId(), team.getName(), team.getLogoImagePath(), luckyIndex);
    }

    private int calcAvgLuckyIndex(List<PlayerWithLuckyIndex> players) {
        return (int) players.stream()
                .map(PlayerWithLuckyIndex::luckyIndex)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }
}
