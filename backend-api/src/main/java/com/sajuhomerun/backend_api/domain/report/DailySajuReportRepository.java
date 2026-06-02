package com.sajuhomerun.backend_api.domain.report;

import com.sajuhomerun.backend_api.domain.player.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;


public interface DailySajuReportRepository extends JpaRepository<DailySajuReport, Long> {
    Optional<DailySajuReport> findByGameDateAndPlayer(LocalDate gameDate, Player player);
}
