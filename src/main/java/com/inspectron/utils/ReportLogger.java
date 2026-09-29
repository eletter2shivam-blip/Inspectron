package com.inspectron.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.aventstack.extentreports.Status;
import com.inspectron.listeners.TestListener;

public final class ReportLogger {

    private static final Logger logger = LoggerFactory.getLogger(ReportLogger.class);

    private ReportLogger() {
    }

    private static String sanitize(String message) {
        if (message == null) {
            return "";
        }
        // Redact any password patterns or credentials
        return message
                .replaceAll("(?i)(password\\s*[:=]\\s*)([^\\s,;]+)", "$1[PROTECTED]")
                .replaceAll("(?i)(confirmPassword\\s*[:=]\\s*)([^\\s,;]+)", "$1[PROTECTED]")
                .replaceAll("(?i)(token\\s*[:=]\\s*)([^\\s,;]+)", "$1[REDACTED_TOKEN]");
    }

    public static void info(String message) {
        String clean = sanitize(message);
        logger.info(clean);
        if (TestListener.getTest() != null) {
            TestListener.getTest().log(Status.INFO, clean);
        }
    }

    public static void pass(String message) {
        String clean = sanitize(message);
        logger.info("[PASS] {}", clean);
        if (TestListener.getTest() != null) {
            TestListener.getTest().log(Status.PASS, clean);
        }
    }

    public static void warn(String message) {
        String clean = sanitize(message);
        logger.warn(clean);
        if (TestListener.getTest() != null) {
            TestListener.getTest().log(Status.WARNING, clean);
        }
    }

    public static void fail(String message) {
        String clean = sanitize(message);
        logger.error("[FAIL] {}", clean);
        if (TestListener.getTest() != null) {
            TestListener.getTest().log(Status.FAIL, clean);
        }
    }

    public static void debug(String message) {
        String clean = sanitize(message);
        logger.debug(clean);
    }
}
