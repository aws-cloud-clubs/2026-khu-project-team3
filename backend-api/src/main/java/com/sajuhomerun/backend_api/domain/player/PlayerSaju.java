package com.sajuhomerun.backend_api.domain.player;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "player_saju")
public class PlayerSaju {
    @OneToOne
    @MapsId // id와 player.id는 항상 같은 값이다
    @JoinColumn(name = "player_id")
    private Player player;

    @Id // PK가 있어야 하므로 설정. JPA는 같은 컬럼인 player_id를 두 관점에서 봄
    @Column(name = "player_id")
    private Long id;

    @Column(name = "year_pillar", nullable = false)
    private String yearPillar;
    @Column(name = "month_pillar", nullable = false)
    private String monthPillar;
    @Column(name = "day_pillar", nullable = false)
    private String dayPillar;
    @Column(name = "hour_pillar")
    private String hourPillar;
    @Column(name = "day_master")
    private String dayMaster;


    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "five_elements", nullable = false)
    private FiveElement fiveElements;
}
