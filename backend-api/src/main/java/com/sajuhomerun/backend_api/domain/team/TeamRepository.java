package com.sajuhomerun.backend_api.domain.team;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findAllByRankingIsNotNullOrderByRankingAsc();
}
