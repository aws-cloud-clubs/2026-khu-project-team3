package com.sajuhomerun.backend_api.domain.game;


import com.sajuhomerun.backend_api.domain.team.Team;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "games", uniqueConstraints = {
        @UniqueConstraint(
                columnNames = {
                        "game_date",
                        "home_team_id",
                        "away_team_id"
                }
        )
})
public class Game {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "game_date", nullable = false)
    private LocalDate gameDate;
    @Column(name = "game_time")
    private LocalTime gameTime;
    @Column(name = "stadium")
    private String stadium;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "home_team_id", nullable = false)
    private Team homeTeam;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "away_team_id", nullable = false)
    private Team awayTeam;
}
