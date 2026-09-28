package com.cmgalaxy.tests.navigation;

import org.testng.Assert;
import org.testng.annotations.Test;
import com.cmgalaxy.base.BaseTest;
import com.cmgalaxy.pages.LoginPage;
import com.cmgalaxy.pages.PrivacyPolicyPage;
import com.cmgalaxy.pages.SignupPage;
import com.cmgalaxy.pages.TermsConditionsPage;
import com.cmgalaxy.utils.ReportLogger;

public class SignupNavigationTest extends BaseTest {

    @Test(
            groups = {"navigation", "smoke"},
            description = "CM-SIGNUP-071: Verify navigation from Signup page to Login page"
    )
    public void testNavigateSignupToLogin() {
        ReportLogger.info("Starting navigation test: Signup -> Login");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        LoginPage loginPage = signupPage.clickLoginLink();
        Assert.assertTrue(loginPage.getCurrentUrl().contains("/login"), "Navigated URL should contain /login");
        Assert.assertTrue(loginPage.isLoginPageLoaded(), "Login page inputs should be visible");
    }

    @Test(
            groups = {"navigation"},
            description = "CM-SIGNUP-072: Verify navigation from Login page back to Signup page"
    )
    public void testNavigateLoginToSignup() {
        ReportLogger.info("Starting navigation test: Login -> Signup");
        LoginPage loginPage = new LoginPage(getDriver());
        loginPage.navigateToLoginPage();

        SignupPage signupPage = loginPage.clickSignUpLink();
        Assert.assertTrue(signupPage.getCurrentUrl().contains("/sign-up"), "Navigated URL should contain /sign-up");
        Assert.assertTrue(signupPage.areAllFieldsDisplayed(), "Signup page form should be displayed");
    }

    @Test(
            groups = {"navigation", "legal"},
            description = "CM-SIGNUP-073: Verify clicking Terms & Conditions opens target page in new tab"
    )
    public void testTermsAndConditionsLink() {
        ReportLogger.info("Starting navigation test: Terms & Conditions link");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        TermsConditionsPage termsPage = signupPage.clickTermsConditionsLink();
        Assert.assertTrue(termsPage.getCurrentUrl().contains("/termsconditions"), "Terms page URL must contain /termsconditions");
        termsPage.closeCurrentTabAndSwitchBack();
        Assert.assertTrue(signupPage.getCurrentUrl().contains("/sign-up"), "Should return cleanly to signup page");
    }

    @Test(
            groups = {"navigation", "legal"},
            description = "CM-SIGNUP-074: Verify clicking Privacy Policy opens target page in new tab"
    )
    public void testPrivacyPolicyLink() {
        ReportLogger.info("Starting navigation test: Privacy Policy link");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        PrivacyPolicyPage privacyPage = signupPage.clickPrivacyPolicyLink();
        Assert.assertTrue(privacyPage.getCurrentUrl().contains("/privacypolicy"), "Privacy policy URL must contain /privacypolicy");
        privacyPage.closeCurrentTabAndSwitchBack();
        Assert.assertTrue(signupPage.getCurrentUrl().contains("/sign-up"), "Should return cleanly to signup page");
    }

    @Test(
            groups = {"navigation", "browser"},
            description = "CM-SIGNUP-010: Verify browser Back and Forward navigation retains stability"
    )
    public void testBrowserBackAndForwardNavigation() {
        ReportLogger.info("Starting browser navigation test: Back and Forward history");
        LoginPage loginPage = new LoginPage(getDriver());
        loginPage.navigateToLoginPage();

        SignupPage signupPage = loginPage.clickSignUpLink();
        Assert.assertTrue(signupPage.getCurrentUrl().contains("/sign-up"));

        signupPage.navigateBack();
        Assert.assertTrue(getDriver().getCurrentUrl().contains("/login"), "Browser back should navigate to /login");

        signupPage.navigateForward();
        Assert.assertTrue(getDriver().getCurrentUrl().contains("/sign-up"), "Browser forward should navigate back to /sign-up");
    }
}
