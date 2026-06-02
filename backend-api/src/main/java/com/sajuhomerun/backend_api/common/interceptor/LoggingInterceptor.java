package com.sajuhomerun.backend_api.common.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class LoggingInterceptor
        implements HandlerInterceptor {

    private static final String START_TIME =
            "START_TIME";

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler
    ) {

        request.setAttribute(
                START_TIME,
                System.currentTimeMillis()
        );

        log.info(
                "[REQ] {} {}",
                request.getMethod(),
                request.getRequestURI()
        );

        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            @NonNull Object handler,
            Exception ex
    ) {

        long startTime = (Long) request.getAttribute(
                START_TIME
        );

        long duration =
                System.currentTimeMillis() - startTime;

        int status = response.getStatus();

        String message = String.format(
                "[RES] %s %s status=%d duration=%dms",
                request.getMethod(),
                request.getRequestURI(),
                status,
                duration
        );

        if (status >= 500) {
            if (ex != null) {
                log.error(message, ex);
            }else{
                log.error(message, ex);
            }
        }
        else if (status >= 400) {
            log.warn(message);
        }
        else {
            log.info(message);
        }
    }
}
