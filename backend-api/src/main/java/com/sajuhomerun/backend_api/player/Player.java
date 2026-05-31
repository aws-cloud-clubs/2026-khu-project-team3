package com.sajuhomerun.backend_api.player;

import com.sajuhomerun.backend_api.team.Team;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Player {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "birth_time")
    private LocalTime birthTime;

    @Column(
            name = "zodiac_sign",
            insertable = false,
            updatable = false
    )
    private String zodiacSign;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
