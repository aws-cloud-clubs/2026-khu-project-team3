package com.sajuhomerun.backend_api.domain.player;

import com.sajuhomerun.backend_api.domain.player.dto.*;
import com.sajuhomerun.backend_api.domain.report.DailySajuReport;
import com.sajuhomerun.backend_api.domain.report.DailySajuReportRepository;
import com.sajuhomerun.backend_api.domain.zodiac.ZodiacFortuneRanking;
import com.sajuhomerun.backend_api.domain.zodiac.ZodiacFortuneRankingRepository;
import com.sajuhomerun.backend_api.domain.zodiac.ZodiacSign;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

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
        Player player = playerRepository.findPlayerByIdWithTeam(playerId).orElseThrow(
                () -> new IllegalArgumentException("선수를 찾을 수 없습니다.")
        );

        DailySajuReport report = dailySajuReportRepository.findByGameDateAndPlayer(
                gameDate, player
        ).or(() -> dailySajuReportRepository.findTopByPlayerOrderByGameDateDescIdDesc(player))
                .orElseThrow(
                        () -> new IllegalArgumentException("운세가 없습니다.")
                );

        ZodiacFortuneRanking zodiac = zodiacFortuneRankingRepository.findByZodiacSign(
                player.getZodiacSign()
        ).orElseThrow(
                () -> new IllegalArgumentException("별자리 정보가 없습니다.")
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
