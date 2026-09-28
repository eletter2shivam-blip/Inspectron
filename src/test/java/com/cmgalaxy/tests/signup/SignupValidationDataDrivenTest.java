package com.cmgalaxy.tests.signup;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import com.cmgalaxy.base.BaseTest;
import com.cmgalaxy.pages.SignupPage;
import com.cmgalaxy.utils.ReportLogger;
import com.cmgalaxy.utils.TestDataFactory;

public class SignupValidationDataDrivenTest extends BaseTest {

    @DataProvider(name = "invalidEmailData")
    public Object[][] invalidEmailDataProvider() {
        return TestDataFactory.getInvalidEmails();
    }

    @Test(
            dataProvider = "invalidEmailData",
            groups = {"negative", "validation"},
            description = "Data-driven email validation tests covering format, spaces, and special characters"
    )
    public void testEmailValidation(String testId, String inputEmail, String expectedError, String description) {
        ReportLogger.info("[" + testId + "] Testing Email: '" + inputEmail + "' - " + description);
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterEmail(inputEmail);
        signupPage.triggerBlurOnField("email");
        signupPage.clickSignUpButton();

        String actualError = signupPage.getEmailError();
        ReportLogger.info("[" + testId + "] Expected error: '" + expectedError + "', Actual error: '" + actualError + "'");
        Assert.assertEquals(actualError, expectedError, "Validation message mismatch for test: " + testId + " (" + description + ")");
    }

    @DataProvider(name = "invalidConfirmPasswordData")
    public Object[][] invalidConfirmPasswordDataProvider() {
        return TestDataFactory.getInvalidConfirmPasswords();
    }

    @Test(
            dataProvider = "invalidConfirmPasswordData",
            groups = {"negative", "validation"},
            description = "Data-driven confirm password validation tests covering mismatch, case difference, and spaces"
    )
    public void testConfirmPasswordValidation(String testId, String password, String confirmPassword, String expectedError, String description) {
        ReportLogger.info("[" + testId + "] Testing Confirm Password mismatch - " + description);
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterPassword(password);
        signupPage.enterConfirmPassword(confirmPassword);
        signupPage.triggerBlurOnField("confirmpassword");
        signupPage.clickSignUpButton();

        String actualError = signupPage.getConfirmPasswordError();
        ReportLogger.info("[" + testId + "] Expected error: '" + expectedError + "', Actual error: '" + actualError + "'");
        Assert.assertEquals(actualError, expectedError, "Validation message mismatch for test: " + testId + " (" + description + ")");
    }

    @DataProvider(name = "invalidPhoneData")
    public Object[][] invalidPhoneDataProvider() {
        return TestDataFactory.getInvalidPhones();
    }

    @Test(
            dataProvider = "invalidPhoneData",
            groups = {"negative", "validation"},
            description = "Data-driven phone number validation tests covering length constraints"
    )
    public void testPhoneValidation(String testId, String phoneInput, String expectedError, String description) {
        ReportLogger.info("[" + testId + "] Testing Phone: '" + phoneInput + "' - " + description);
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterPhone(phoneInput);
        signupPage.triggerBlurOnField("phone");
        signupPage.clickSignUpButton();

        String actualError = signupPage.getPhoneError();
        ReportLogger.info("[" + testId + "] Expected error: '" + expectedError + "', Actual error: '" + actualError + "'");
        Assert.assertEquals(actualError, expectedError, "Validation message mismatch for test: " + testId + " (" + description + ")");
    }
}
