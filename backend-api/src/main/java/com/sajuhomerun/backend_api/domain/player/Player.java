package com.sajuhomerun.backend_api.domain.player;

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
@Table(name = "players")
public class Player {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String position;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "birth_time")
    private LocalTime birthTime;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "zodiac_sign",
            insertable = false,
            updatable = false,
            nullable = false
    )
    private ZodiacSign zodiacSign;


    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
