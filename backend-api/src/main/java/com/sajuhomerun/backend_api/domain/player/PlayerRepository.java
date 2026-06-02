package com.sajuhomerun.backend_api.domain.player;

import com.sajuhomerun.backend_api.domain.game.dto.PlayerWithLuckyIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
            select p.id, p.name, p.position, r.luckyIndex
            from Player p
            join DailySajuReport r on r.player.id = p.id
            where p.team.id = :teamId and r.gameDate = :gameDate
    """)
    List<PlayerWithLuckyIndex> findPlayersWithLuckyIndexByGameDateAndTeam(
                @Param("gameDate") LocalDate gameDate,
                @Param("teamId") Long teamId
            );
}
