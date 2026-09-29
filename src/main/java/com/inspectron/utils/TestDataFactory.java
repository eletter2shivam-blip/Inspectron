package com.inspectron.utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.inspectron.constants.FrameworkConstants;
import com.inspectron.models.UserRegistrationData;

public final class TestDataFactory {

    private static final Logger logger = LoggerFactory.getLogger(TestDataFactory.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static JsonNode rootNode;

    static {
        try {
            File jsonFile = new File(FrameworkConstants.TESTDATA_JSON_PATH);
            if (jsonFile.exists()) {
                rootNode = objectMapper.readTree(jsonFile);
                logger.info("Successfully loaded test data from {}", FrameworkConstants.TESTDATA_JSON_PATH);
            } else {
                logger.warn("Test data JSON file not found at {}", FrameworkConstants.TESTDATA_JSON_PATH);
            }
        } catch (IOException e) {
            logger.error("Failed to parse test data JSON", e);
        }
    }

    private TestDataFactory() {
    }

    /**
     * Generates a completely unique, valid enterprise user to guarantee that
     * registration tests never fail due to duplicate email constraints.
     */
    public static UserRegistrationData generateUniqueUser() {
        long timestamp = System.currentTimeMillis();
        int randomSuffix = new Random().nextInt(9000) + 1000;
        String uniqueEmail = "qa.alex." + timestamp + "@testmail.com";
        String uniquePhone = "9" + (100000000L + new Random().nextInt(800000000));

        UserRegistrationData user = new UserRegistrationData();
        user.setFirstName("Alexander");
        user.setLastName("Automation");
        user.setPhone(uniquePhone);
        user.setEmail(uniqueEmail);
        user.setPassword("Galaxy#Pass2026");
        user.setConfirmPassword("Galaxy#Pass2026");
        user.setDescription("Dynamically generated unique user");
        return user;
    }

    public static Object[][] getValidationData(String sectionName) {
        if (rootNode == null || !rootNode.has(sectionName)) {
            logger.warn("Section {} not found in test data JSON", sectionName);
            return new Object[0][0];
        }

        JsonNode arrayNode = rootNode.get(sectionName);
        List<Object[]> dataList = new ArrayList<>();

        for (JsonNode item : arrayNode) {
            String testId = item.has("testId") ? item.get("testId").asText() : "";
            String input = item.has("input") ? item.get("input").asText() : "";
            String expectedError = item.has("expectedError") ? item.get("expectedError").asText() : "";
            String description = item.has("description") ? item.get("description").asText() : "";

            if (item.has("password") && item.has("confirmPassword")) {
                String pass = item.get("password").asText();
                String confirmPass = item.get("confirmPassword").asText();
                dataList.add(new Object[]{testId, pass, confirmPass, expectedError, description});
            } else {
                dataList.add(new Object[]{testId, input, expectedError, description});
            }
        }

        return dataList.toArray(new Object[0][0]);
    }

    public static Object[][] getInvalidEmails() {
        return getValidationData("invalidEmails");
    }

    public static Object[][] getInvalidPasswords() {
        return getValidationData("invalidPasswords");
    }

    public static Object[][] getInvalidFirstNames() {
        return getValidationData("invalidFirstNames");
    }

    public static Object[][] getInvalidLastNames() {
        return getValidationData("invalidLastNames");
    }

    public static Object[][] getInvalidConfirmPasswords() {
        return getValidationData("invalidConfirmPasswords");
    }

    public static Object[][] getInvalidPhones() {
        return getValidationData("invalidPhones");
    }
}
