package com.sajuhomerun.backend_api.domain.game;

import com.sajuhomerun.backend_api.domain.game.dto.GameInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {

    // 특정 날짜에 하는 경기 조회
    @Query("""
        select g
        from Game g
        join fetch g.homeTeam
        join fetch g.awayTeam
        where g.gameDate = :gameDate
    """)
    List<Game> findGamesByGameDateWithTeams(@Param("gameDate") LocalDate gameDate);

    @Query("""
        select g
        from Game g
        join fetch g.homeTeam
        join fetch g.awayTeam
        where g.id = :id
    """)
    Optional<Game> findGameByIdWithTeams(@Param("id") Long id);
}
