package com.cmgalaxy.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import com.cmgalaxy.config.ConfigurationManager;
import com.cmgalaxy.utils.ReportLogger;
import com.cmgalaxy.utils.WaitUtils;

public class LoginPage extends BasePage {

    // Login page uses id="Email" and name="user_name"
    private final By emailInput = By.cssSelector("input#Email, input[name='user_name']");
    private final By passwordInput = By.cssSelector("input[type='password']");
    private final By loginButton = By.cssSelector("button[type='submit']");
    private final By signUpLink = By.cssSelector("a[href='/sign-up']");
    private final By forgotPasswordLink = By.cssSelector("a[href='/forgot-password']");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public LoginPage navigateToLoginPage() {
        String url = ConfigurationManager.getLoginUrl();
        ReportLogger.info("Navigating to CM Galaxy Login page: " + url);
        driver.get(url);
        WaitUtils.waitForPageLoad(driver);
        WaitUtils.waitForVisibility(driver, emailInput);
        return this;
    }

    public SignupPage clickSignUpLink() {
        ReportLogger.info("Clicking 'Sign Up' link from Login page");
        click(signUpLink);
        WaitUtils.waitForUrlContains(driver, "/sign-up");
        return new SignupPage(driver);
    }

    public boolean isLoginPageLoaded() {
        try {
            WaitUtils.waitForVisibility(driver, emailInput);
            return isDisplayed(emailInput) && isDisplayed(loginButton);
        } catch (Exception e) {
            return false;
        }
    }
}
