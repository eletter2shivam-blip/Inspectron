package com.cmgalaxy.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.cmgalaxy.constants.FrameworkConstants;

public final class ConfigurationManager {

    private static final Logger logger = LoggerFactory.getLogger(ConfigurationManager.class);
    private static final Properties properties = new Properties();

    static {
        try (FileInputStream fis = new FileInputStream(FrameworkConstants.CONFIG_FILE_PATH)) {
            properties.load(fis);
            logger.info("Loaded configuration properties from {}", FrameworkConstants.CONFIG_FILE_PATH);
        } catch (IOException e) {
            logger.error("Failed to load config.properties, using system defaults", e);
        }
    }

    private ConfigurationManager() {
    }

    public static String getProperty(String key, String defaultValue) {
        // Priority: System property > Environment variable > config.properties > defaultValue
        String systemProperty = System.getProperty(key);
        if (systemProperty != null && !systemProperty.trim().isEmpty()) {
            return systemProperty.trim();
        }

        String envValue = System.getenv(key.replace('.', '_').toUpperCase());
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue.trim();
        }

        return properties.getProperty(key, defaultValue).trim();
    }

    public static String getProperty(String key) {
        return getProperty(key, "");
    }

    public static String getBaseUrl() {
        return getProperty("baseUrl", FrameworkConstants.BASE_URL);
    }

    public static String getSignupUrl() {
        return getProperty("signupUrl", FrameworkConstants.SIGNUP_URL);
    }

    public static String getLoginUrl() {
        return getProperty("loginUrl", FrameworkConstants.LOGIN_URL);
    }

    public static String getBrowser() {
        return getProperty("browser", "chrome").toLowerCase();
    }

    public static boolean isHeadless() {
        return Boolean.parseBoolean(getProperty("headless", "false"));
    }

    public static int getExplicitWait() {
        try {
            return Integer.parseInt(getProperty("explicitWait", String.valueOf(FrameworkConstants.DEFAULT_EXPLICIT_WAIT)));
        } catch (NumberFormatException e) {
            return FrameworkConstants.DEFAULT_EXPLICIT_WAIT;
        }
    }

    public static int getPageLoadTimeout() {
        try {
            return Integer.parseInt(getProperty("pageLoadTimeout", String.valueOf(FrameworkConstants.DEFAULT_PAGE_LOAD_TIMEOUT)));
        } catch (NumberFormatException e) {
            return FrameworkConstants.DEFAULT_PAGE_LOAD_TIMEOUT;
        }
    }

    public static boolean isCaptchaEnabled() {
        return Boolean.parseBoolean(getProperty("captcha.enabled", "false"));
    }

    public static boolean isCaptchaManual() {
        return Boolean.parseBoolean(getProperty("captcha.manual", "false"));
    }
}
