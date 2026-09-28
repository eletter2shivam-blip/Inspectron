package com.cmgalaxy.tests.signup;

import org.testng.Assert;
import org.testng.annotations.Test;
import com.cmgalaxy.base.BaseTest;
import com.cmgalaxy.pages.SignupPage;
import com.cmgalaxy.utils.ReportLogger;

public class SignupSecurityTest extends BaseTest {

    @Test(
            groups = {"security-basic"},
            description = "CM-SIGNUP-078: Verify password inputs are masked with type='password'"
    )
    public void testPasswordFieldsMaskedByDefault() {
        ReportLogger.info("Starting security test: Masked password fields");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        Assert.assertEquals(signupPage.getPasswordInputType(), "password", "Password field must have type='password'");
        Assert.assertEquals(signupPage.getConfirmPasswordInputType(), "password", "Confirm password field must have type='password'");
    }

    @Test(
            groups = {"security-basic"},
            description = "CM-SIGNUP-080: Verify HTML/Script tags are safely rejected without execution"
    )
    public void testXssInputHandling() {
        ReportLogger.info("Starting security test: XSS input handling");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        String xssPayload = "<script>alert('xss')</script>";
        signupPage.enterFirstName(xssPayload);
        signupPage.triggerBlurOnField("firstname");
        signupPage.clickSignUpButton();

        // Must display alphabetical validation error and not trigger any alert
        String error = signupPage.getFirstNameError();
        Assert.assertTrue(error.contains("alphabetical"), "Script injection must be rejected with alphabetical error: " + error);
    }

    @Test(
            groups = {"security-basic"},
            description = "CM-SIGNUP-025: Verify SQL injection input is safely rejected"
    )
    public void testSqlInjectionInputHandling() {
        ReportLogger.info("Starting security test: SQL injection input handling");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        String sqlPayload = "' OR '1'='1";
        signupPage.enterFirstName(sqlPayload);
        signupPage.triggerBlurOnField("firstname");
        signupPage.clickSignUpButton();

        String error = signupPage.getFirstNameError();
        Assert.assertTrue(error.contains("alphabetical"), "SQL injection string must be rejected: " + error);
    }
}
