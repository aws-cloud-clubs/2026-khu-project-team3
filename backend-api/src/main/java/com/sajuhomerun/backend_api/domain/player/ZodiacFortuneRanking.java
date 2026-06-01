package com.sajuhomerun.backend_api.domain.player;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "zodiac_fortune_rankings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ZodiacFortuneRanking {

    @Enumerated(EnumType.STRING)
    @Id @Column(name = "zodiac_sign")
    private ZodiacSign zodiacSign;

    @Column(name = "fortune_date", nullable = false)
    private LocalDate fortuneDate;

    @Column(nullable = false)
    private Integer rank;
}
