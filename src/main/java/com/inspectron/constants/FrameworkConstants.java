package com.inspectron.constants;

public final class FrameworkConstants {

    private FrameworkConstants() {
        // Prevent instantiation
    }

    public static final String CONFIG_FILE_PATH = "src/test/resources/config.properties";
    public static final String TESTDATA_JSON_PATH = "src/test/resources/testdata/signup-data.json";
    public static final String EXTENT_REPORT_DIR = "reports";
    public static final String EXTENT_REPORT_FILE = "reports/extent-report.html";
    public static final String SCREENSHOTS_DIR = "reports/screenshots";

    public static final int DEFAULT_EXPLICIT_WAIT = 15;
    public static final int DEFAULT_PAGE_LOAD_TIMEOUT = 30;
    public static final int DEFAULT_SCRIPT_TIMEOUT = 15;

    public static final String BASE_URL = "https://platform.inspectron.com";
    public static final String SIGNUP_URL = "https://platform.inspectron.com/sign-up";
    public static final String LOGIN_URL = "https://platform.inspectron.com/login";
    public static final String TERMS_URL = "https://platform.inspectron.com/termsconditions";
    public static final String PRIVACY_URL = "https://platform.inspectron.com/privacypolicy";

    public static final String EXPECTED_PAGE_TITLE = "INSPECTRON - AI Powered Marketing Platform";
}
