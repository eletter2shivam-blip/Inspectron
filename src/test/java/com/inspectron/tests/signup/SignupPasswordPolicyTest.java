package com.inspectron.tests.signup;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import com.inspectron.base.BaseTest;
import com.inspectron.pages.SignupPage;
import com.inspectron.utils.ReportLogger;
import com.inspectron.utils.TestDataFactory;

public class SignupPasswordPolicyTest extends BaseTest {

    @DataProvider(name = "invalidPasswordData")
    public Object[][] invalidPasswordDataProvider() {
        return TestDataFactory.getInvalidPasswords();
    }

    @Test(
            dataProvider = "invalidPasswordData",
            groups = {"negative", "validation", "security-basic"},
            description = "Verify password policy constraints: 8+ chars, uppercase, lowercase, number, special char"
    )
    public void testPasswordPolicyRules(String testId, String invalidPassword, String expectedError, String description) {
        ReportLogger.info("[" + testId + "] Testing password rule violation: " + description);
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterPassword(invalidPassword);
        signupPage.triggerBlurOnField("password");
        signupPage.clickSignUpButton();

        String actualError = signupPage.getPasswordError();
        ReportLogger.info("[" + testId + "] Expected: '" + expectedError + "', Actual: '" + actualError + "'");
        Assert.assertEquals(actualError, expectedError, "Password policy error message mismatch for: " + description);
    }

    @Test(
            groups = {"ui", "security-basic"},
            description = "CM-SIGNUP-058 & 059: Verify password visibility toggle button switches input type between password and text"
    )
    public void testPasswordVisibilityToggle() {
        ReportLogger.info("Starting test: Password visibility toggle");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterPassword("Pass@1234");
        Assert.assertEquals(signupPage.getPasswordInputType(), "password", "Password should be masked by default with type='password'");

        signupPage.togglePasswordVisibility();
        Assert.assertEquals(signupPage.getPasswordInputType(), "text", "Password should be revealed with type='text' after toggle");

        signupPage.togglePasswordVisibility();
        Assert.assertEquals(signupPage.getPasswordInputType(), "password", "Password should be re-masked after toggling again");
    }

    @Test(
            groups = {"ui", "security-basic"},
            description = "CM-SIGNUP-066: Verify confirm password visibility toggle button switches input type between password and text"
    )
    public void testConfirmPasswordVisibilityToggle() {
        ReportLogger.info("Starting test: Confirm Password visibility toggle");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterConfirmPassword("Pass@1234");
        Assert.assertEquals(signupPage.getConfirmPasswordInputType(), "password", "Confirm password should be masked by default");

        signupPage.toggleConfirmPasswordVisibility();
        Assert.assertEquals(signupPage.getConfirmPasswordInputType(), "text", "Confirm password should be revealed after toggle");

        signupPage.toggleConfirmPasswordVisibility();
        Assert.assertEquals(signupPage.getConfirmPasswordInputType(), "password", "Confirm password should be re-masked after toggle");
    }
}
