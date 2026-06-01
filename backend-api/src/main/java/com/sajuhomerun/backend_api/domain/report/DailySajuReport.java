package com.sajuhomerun.backend_api.domain.report;

import com.sajuhomerun.backend_api.domain.player.Player;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "daily_saju_report")
public class DailySajuReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(name = "game_date", nullable = false)
    private LocalDate gameDate;
    @Column(name = "game_day_stem")
    private String gameDayStem;
    @Column(name = "game_day_branch")
    private String gameDayBranch;

    @Column(name = "report_text")
    private String reportText;
    @Column(name = "lucky_index")
    private Integer luckyIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReportStatus reportStatus;
}
