package com.cmgalaxy.tests.signup;

import org.openqa.selenium.Dimension;
import org.testng.Assert;
import org.testng.annotations.Test;
import com.cmgalaxy.base.BaseTest;
import com.cmgalaxy.pages.SignupPage;
import com.cmgalaxy.utils.ReportLogger;

public class SignupResponsiveTest extends BaseTest {

    @Test(
            groups = {"responsive", "ui"},
            description = "CM-SIGNUP-075: Verify Signup page layout on Desktop viewport (1920x1080)"
    )
    public void testDesktopViewport() {
        ReportLogger.info("Testing Desktop Viewport: 1920x1080");
        getDriver().manage().window().setSize(new Dimension(1920, 1080));

        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        Assert.assertTrue(signupPage.areAllFieldsDisplayed(), "All inputs must be visible on Desktop");
        Assert.assertTrue(signupPage.isSubmitButtonDisplayed(), "Submit button must be visible on Desktop");
    }

    @Test(
            groups = {"responsive", "ui"},
            description = "CM-SIGNUP-076: Verify Signup page layout on Tablet viewport (768x1024)"
    )
    public void testTabletViewport() {
        ReportLogger.info("Testing Tablet Viewport: 768x1024");
        getDriver().manage().window().setSize(new Dimension(768, 1024));

        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        Assert.assertTrue(signupPage.areAllFieldsDisplayed(), "All inputs must be visible on Tablet");
        Assert.assertTrue(signupPage.isSubmitButtonDisplayed(), "Submit button must be visible on Tablet");
    }

    @Test(
            groups = {"responsive", "ui"},
            description = "CM-SIGNUP-077: Verify Signup page layout on Mobile viewport (375x667)"
    )
    public void testMobileViewport() {
        ReportLogger.info("Testing Mobile Viewport: 375x667");
        getDriver().manage().window().setSize(new Dimension(375, 667));

        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        Assert.assertTrue(signupPage.areAllFieldsDisplayed(), "All inputs must be visible on Mobile");
        Assert.assertTrue(signupPage.isSubmitButtonDisplayed(), "Submit button must be visible on Mobile");
    }
}
