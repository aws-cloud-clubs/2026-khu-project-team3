package com.sajuhomerun.backend_api.common;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

@Component
public class ServiceDateProvider {
    private static final String SERVICE_TODAY_KEY = "service_today";
    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");
    private static final Duration CACHE_TTL = Duration.ofSeconds(30);

    private final JdbcTemplate jdbcTemplate;
    private volatile LocalDate cachedToday;
    private volatile Instant cachedAt;

    public ServiceDateProvider(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public LocalDate today() {
        Instant now = Instant.now();
        if (cachedToday != null && cachedAt != null && cachedAt.plus(CACHE_TTL).isAfter(now)) {
            return cachedToday;
        }

        synchronized (this) {
            now = Instant.now();
            if (cachedToday != null && cachedAt != null && cachedAt.plus(CACHE_TTL).isAfter(now)) {
                return cachedToday;
            }

            cachedToday = loadToday();
            cachedAt = now;
            return cachedToday;
        }
    }

    private LocalDate loadToday() {
        try {
            String value = jdbcTemplate.queryForObject(
                    """
                    SELECT setting_value
                    FROM app_settings
                    WHERE setting_key = ?
                    """,
                    String.class,
                    SERVICE_TODAY_KEY
            );
            return LocalDate.parse(value);
        } catch (EmptyResultDataAccessException e) {
            return LocalDate.now(SERVICE_ZONE);
        }
    }
}
