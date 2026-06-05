package com.sajuhomerun.backend_api.domain.player;

import com.sajuhomerun.backend_api.domain.game.dto.PlayerWithLuckyIndex;
import com.sajuhomerun.backend_api.domain.game.dto.PlayerWithLuckyIndexByTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    @Query("""
        select p
        from Player p
        join fetch p.team
        where p.id = :id
    """)
    Optional<Player> findPlayerByIdWithTeam(
            @Param("id") Long id
    );

    @Query("""
            select p.id, p.name, p.position, r.luckyIndex, p.profileImagePath
            from Player p
            join DailySajuReport r on r.player.id = p.id
            where p.team.id = :teamId and r.gameDate = :gameDate
    """)
    List<PlayerWithLuckyIndex> findPlayersWithLuckyIndexByGameDateAndTeam(
                @Param("gameDate") LocalDate gameDate,
                @Param("teamId") Long teamId
            );

    @Query("""
            select p.team.id, p.id, p.name, p.position, r.luckyIndex, p.profileImagePath
            from Player p
            join DailySajuReport r on r.player.id = p.id
            where p.team.id in :teamIds and r.gameDate = :gameDate
    """)
    List<PlayerWithLuckyIndexByTeam> findPlayersWithLuckyIndexByGameDateAndTeamIds(
            @Param("gameDate") LocalDate gameDate,
            @Param("teamIds") List<Long> teamIds
    );
}
