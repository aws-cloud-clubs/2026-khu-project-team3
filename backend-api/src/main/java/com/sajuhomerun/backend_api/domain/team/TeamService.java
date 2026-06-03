package com.sajuhomerun.backend_api.domain.team;

import com.sajuhomerun.backend_api.domain.player.dto.TeamInfo;
import com.sajuhomerun.backend_api.domain.team.dto.KboRankingResponse;
import com.sajuhomerun.backend_api.domain.team.dto.TeamRankingItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {
    private final TeamRepository teamRepository;

    public KboRankingResponse getKboRankings() {
        log.info("Loading KBO team rankings");
        List<TeamRankingItem> items = teamRepository.findAllByRankingIsNotNullOrderByRankingAsc()
                .stream()
                .map(t -> new TeamRankingItem(
                        t.getRanking(),
                        new TeamInfo(t.getId(), t.getName(), t.getLogoImagePath())
                ))
                .toList();
        log.info("Loaded KBO team rankings. count={}", items.size());
        return new KboRankingResponse(items);
    }
}
