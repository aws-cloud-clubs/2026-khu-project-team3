package com.sajuhomerun.backend_api.domain.zodiac;

public enum ZodiacSign {

    ARIES("ARIES"),
    TAURUS("TAURUS"),
    GEMINI("GEMINI"),
    CANCER("CANCER"),
    LEO("LEO"),
    VIRGO("VIRGO"),
    LIBRA("LIBRA"),
    SCORPIO("SCORPIO"),
    SAGITTARIUS("SAGITTARIUS"),
    CAPRICORN("CAPRICORN"),
    AQUARIUS("AQUARIUS"),
    PISCES("PISCES");

    private final String value;

    ZodiacSign(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
