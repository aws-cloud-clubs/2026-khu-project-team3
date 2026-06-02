package com.sajuhomerun.backend_api.domain.report;

import lombok.Getter;

@Getter
public enum ReportStatus {
    PENDING("PENDING"),
    GENERATING("GENERATING"),
    GENERATED("GENERATED"),
    FAILED("FAILED");

    private final String value;

    ReportStatus(String value) {
        this.value = value;
    }

}
