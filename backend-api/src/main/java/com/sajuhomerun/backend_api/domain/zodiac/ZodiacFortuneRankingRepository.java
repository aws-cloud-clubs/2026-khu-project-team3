package com.sajuhomerun.backend_api.domain.zodiac;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ZodiacFortuneRankingRepository extends JpaRepository<ZodiacFortuneRanking, ZodiacSign> {

    Optional<ZodiacFortuneRanking> findByZodiacSign(ZodiacSign zodiacSign);
}
