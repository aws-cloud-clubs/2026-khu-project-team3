package com.sajuhomerun.backend_api.domain.player;

import com.sajuhomerun.backend_api.domain.player.dto.*;
import com.sajuhomerun.backend_api.domain.report.DailySajuReport;
import com.sajuhomerun.backend_api.domain.report.DailySajuReportRepository;
import com.sajuhomerun.backend_api.domain.zodiac.ZodiacFortuneRanking;
import com.sajuhomerun.backend_api.domain.zodiac.ZodiacFortuneRankingRepository;
import com.sajuhomerun.backend_api.domain.zodiac.ZodiacSign;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final ZodiacFortuneRankingRepository zodiacFortuneRankingRepository;
    private final DailySajuReportRepository dailySajuReportRepository;

    public PlayerDetailResponse getPlayerDetail(
            Long playerId,
            LocalDate gameDate
    ){
        log.info("Loading player detail. playerId={}, gameDate={}", playerId, gameDate);

        Player player = playerRepository.findPlayerByIdWithTeam(playerId).orElseThrow(() -> {
            log.error("Player not found. playerId={}", playerId);
            return new IllegalArgumentException("선수를 찾을 수 없습니다.");
        });

        log.debug(
                "Player found. playerId={}, teamId={}, zodiacSign={}",
                player.getId(),
                player.getTeam().getId(),
                player.getZodiacSign()
        );

        DailySajuReport report = dailySajuReportRepository.findByGameDateAndPlayer(
                gameDate, player
        ).or(() -> {
            log.warn(
                    "Daily fortune report not found for requested date. playerId={}, gameDate={}",
                    player.getId(),
                    gameDate
            );
            return dailySajuReportRepository.findTopByPlayerOrderByGameDateDescIdDesc(player);
        }).orElseThrow(() -> {
            log.error("No fortune report exists for player. playerId={}", player.getId());
            return new IllegalArgumentException("운세가 없습니다.");
        });

        log.debug(
                "Fortune report selected. playerId={}, reportId={}, reportGameDate={}, status={}",
                player.getId(),
                report.getId(),
                report.getGameDate(),
                report.getReportStatus()
        );

        ZodiacFortuneRanking zodiac = zodiacFortuneRankingRepository.findByZodiacSign(
                player.getZodiacSign()
        ).orElseThrow(() -> {
            log.error(
                    "Zodiac fortune ranking not found. playerId={}, zodiacSign={}",
                    player.getId(),
                    player.getZodiacSign()
            );
            return new IllegalArgumentException("별자리 정보가 없습니다.");
        });

        log.info(
                "Loaded player detail. playerId={}, reportGameDate={}, zodiacSign={}",
                player.getId(),
                report.getGameDate(),
                zodiac.getZodiacSign()
        );

        return new PlayerDetailResponse(
                new PlayerInfo(
                        player.getId(),
                        player.getName(),
                        new TeamInfo(
                                player.getTeam().getId(),
                                player.getTeam().getName(),
                                player.getTeam().getLogoImagePath()
                        ),
                        player.getPosition(),
                        player.getProfileImagePath()
                ),
                new DailyFortune(
                        report.getLuckyIndex(),
                        report.getReportText(),
                        report.getGeneratedAt()
                ),
                new ZodiacFortune(
                        toKoreanZodiacSign(zodiac.getZodiacSign()),
                        zodiac.getFortuneDate(),
                        zodiac.getRank(),
                        zodiac.getFortuneText()
                )
        );

    }

    private String toKoreanZodiacSign(ZodiacSign zodiacSign) {
        return switch (zodiacSign) {
            case ARIES -> "양자리";
            case TAURUS -> "황소자리";
            case GEMINI -> "쌍둥이자리";
            case CANCER -> "게자리";
            case LEO -> "사자자리";
            case VIRGO -> "처녀자리";
            case LIBRA -> "천칭자리";
            case SCORPIO -> "전갈자리";
            case SAGITTARIUS -> "사수자리";
            case CAPRICORN -> "염소자리";
            case AQUARIUS -> "물병자리";
            case PISCES -> "물고기자리";
        };
    }
}
