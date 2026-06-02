package com.sajuhomerun.backend_api.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

@Slf4j
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
            log.debug("Using cached service date. serviceDate={}, cachedAt={}", cachedToday, cachedAt);
            return cachedToday;
        }

        synchronized (this) {
            now = Instant.now();
            if (cachedToday != null && cachedAt != null && cachedAt.plus(CACHE_TTL).isAfter(now)) {
                log.debug("Using cached service date after lock. serviceDate={}, cachedAt={}", cachedToday, cachedAt);
                return cachedToday;
            }

            cachedToday = loadToday();
            cachedAt = now;
            log.info("Loaded service date. serviceDate={}", cachedToday);
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
            log.debug("Service date setting found. settingKey={}, value={}", SERVICE_TODAY_KEY, value);
            return LocalDate.parse(value);
        } catch (EmptyResultDataAccessException e) {
            LocalDate fallbackDate = LocalDate.now(SERVICE_ZONE);
            log.warn(
                    "Service date setting not found. using current date. settingKey={}, fallbackDate={}",
                    SERVICE_TODAY_KEY,
                    fallbackDate
            );
            return fallbackDate;
        } catch (RuntimeException e) {
            log.error("Failed to load service date setting. settingKey={}", SERVICE_TODAY_KEY, e);
            throw e;
        }
    }
}
