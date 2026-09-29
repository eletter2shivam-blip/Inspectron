package com.inspectron.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import com.inspectron.components.OtpVerificationModal;
import com.inspectron.config.ConfigurationManager;
import com.inspectron.models.UserRegistrationData;
import com.inspectron.utils.ReportLogger;
import com.inspectron.utils.WaitUtils;

public class SignupPage extends BasePage {

    // Input fields (verified on live CM Galaxy React DOM)
    private final By firstNameInput = By.id("first_name");
    private final By lastNameInput = By.id("last_name");
    private final By phoneInput = By.id("phone");
    private final By emailInput = By.id("user_email");
    private final By passwordInput = By.id("password");
    private final By confirmPasswordInput = By.id("re_password");

    // Labels
    private final By firstNameLabel = By.cssSelector("label[for='first_name']");
    private final By lastNameLabel = By.cssSelector("label[for='last_name']");
    private final By phoneLabel = By.cssSelector("label[for='phone_no']");
    private final By emailLabel = By.cssSelector("label[for='user_email']");
    private final By passwordLabel = By.cssSelector("label[for='password']");
    private final By confirmPasswordLabel = By.cssSelector("label[for='re_password']");

    // Password visibility toggles
    private final By passwordToggleBtn = By.xpath("//input[@id='password']/following::button[1]");
    private final By confirmPasswordToggleBtn = By.xpath("//input[@id='re_password']/following::button[1]");

    // Submit button
    private final By submitButton = By.cssSelector("button[type='submit']");

    // Links
    private final By loginLink = By.cssSelector("a[href='/login']");
    private final By termsConditionsLink = By.cssSelector("a[href='/termsconditions']");
    private final By privacyPolicyLink = By.cssSelector("a[href='/privacypolicy']");

    // Field-level error messages (Column-isolated XPaths targeting specific <p> tags with text-red classes)
    private final By firstNameError = By.xpath("//div[contains(@class,'w-full') and .//input[@id='first_name'] and not(.//input[@id='last_name'])]//p[contains(@class,'text-red')]");
    private final By lastNameError = By.xpath("//div[contains(@class,'w-full') and .//input[@id='last_name'] and not(.//input[@id='first_name'])]//p[contains(@class,'text-red')]");
    private final By phoneError = By.xpath("//div[contains(@class,'w-full') and .//input[@id='phone'] and not(.//input[@id='user_email'])]//p[contains(@class,'text-red')]");
    private final By emailError = By.xpath("//div[contains(@class,'w-full') and .//input[@id='user_email'] and not(.//input[@id='phone'])]//p[contains(@class,'text-red')]");
    private final By passwordError = By.xpath("//div[contains(@class,'w-full') and .//input[@id='password'] and not(.//input[@id='re_password'])]//p[contains(@class,'text-red')]");
    private final By confirmPasswordError = By.xpath("//div[contains(@class,'w-full') and .//input[@id='re_password'] and not(.//input[@id='password'])]//p[contains(@class,'text-red')]");

    // Stepper & header
    private final By step1Heading = By.xpath("//*[contains(text(),'Sign up starts here!')]");
    private final By toastNotification = By.xpath("//*[contains(@class,'toast') or contains(@role,'alert')]");

    public SignupPage(WebDriver driver) {
        super(driver);
    }

    public SignupPage navigateToSignupPage() {
        String url = ConfigurationManager.getSignupUrl();
        ReportLogger.info("Navigating to CM Galaxy Signup page: " + url);
        driver.get(url);
        WaitUtils.waitForPageLoad(driver);
        WaitUtils.waitForVisibility(driver, step1Heading);
        return this;
    }

    public String getStep1HeadingText() {
        return getText(step1Heading);
    }

    public SignupPage enterFirstName(String firstName) {
        ReportLogger.info("Entering First Name: " + firstName);
        type(firstNameInput, firstName);
        return this;
    }

    public SignupPage enterLastName(String lastName) {
        ReportLogger.info("Entering Last Name: " + lastName);
        type(lastNameInput, lastName);
        return this;
    }

    public SignupPage enterPhone(String phone) {
        ReportLogger.info("Entering Phone Number: " + phone);
        WebElement element = WaitUtils.waitForVisibility(driver, phoneInput);
        element.click();
        element.sendKeys(phone);
        return this;
    }

    public SignupPage enterEmail(String email) {
        ReportLogger.info("Entering Email: " + email);
        type(emailInput, email);
        return this;
    }

    public SignupPage enterPassword(String password) {
        ReportLogger.info("Entering Password: [PROTECTED]");
        type(passwordInput, password);
        return this;
    }

    public SignupPage enterConfirmPassword(String confirmPassword) {
        ReportLogger.info("Entering Confirm Password: [PROTECTED]");
        type(confirmPasswordInput, confirmPassword);
        return this;
    }

    public SignupPage triggerBlurOnField(String fieldName) {
        switch (fieldName.toLowerCase()) {
            case "firstname" -> blur(firstNameInput);
            case "lastname" -> blur(lastNameInput);
            case "phone" -> blur(phoneInput);
            case "email" -> blur(emailInput);
            case "password" -> blur(passwordInput);
            case "confirmpassword" -> blur(confirmPasswordInput);
            default -> logger.warn("Unknown field for blur: {}", fieldName);
        }
        return this;
    }

    public SignupPage fillRegistrationForm(UserRegistrationData user) {
        enterFirstName(user.getFirstName());
        enterLastName(user.getLastName());
        enterPhone(user.getPhone());
        enterEmail(user.getEmail());
        enterPassword(user.getPassword());
        enterConfirmPassword(user.getConfirmPassword());
        return this;
    }

    public SignupPage clickSignUpButton() {
        ReportLogger.info("Clicking 'Sign Up' submit button");
        blur(confirmPasswordInput);
        click(submitButton);
        return this;
    }

    public SignupPage submitUsingEnterKey() {
        ReportLogger.info("Submitting form using Enter key on confirm password field");
        driver.findElement(confirmPasswordInput).sendKeys(Keys.ENTER);
        return this;
    }

    public SignupPage togglePasswordVisibility() {
        ReportLogger.info("Toggling password visibility");
        click(passwordToggleBtn);
        return this;
    }

    public SignupPage toggleConfirmPasswordVisibility() {
        ReportLogger.info("Toggling confirm password visibility");
        click(confirmPasswordToggleBtn);
        return this;
    }

    public String getPasswordInputType() {
        return getAttribute(passwordInput, "type");
    }

    public String getConfirmPasswordInputType() {
        return getAttribute(confirmPasswordInput, "type");
    }

    public LoginPage clickLoginLink() {
        ReportLogger.info("Clicking 'Login' link");
        click(loginLink);
        return new LoginPage(driver);
    }

    public TermsConditionsPage clickTermsConditionsLink() {
        ReportLogger.info("Clicking 'Terms & Conditions' link");
        click(termsConditionsLink);
        switchToNewTab();
        return new TermsConditionsPage(driver);
    }

    public PrivacyPolicyPage clickPrivacyPolicyLink() {
        ReportLogger.info("Clicking 'Privacy Policy' link");
        click(privacyPolicyLink);
        switchToNewTab();
        return new PrivacyPolicyPage(driver);
    }

    private String getOptionalText(By locator) {
        try {
            return driver.findElement(locator).getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public String getFirstNameError() {
        return getOptionalText(firstNameError);
    }

    public String getLastNameError() {
        return getOptionalText(lastNameError);
    }

    public String getPhoneError() {
        return getOptionalText(phoneError);
    }

    public String getEmailError() {
        return getOptionalText(emailError);
    }

    public String getPasswordError() {
        return getOptionalText(passwordError);
    }

    public String getConfirmPasswordError() {
        return getOptionalText(confirmPasswordError);
    }

    public boolean isSubmitButtonDisplayed() {
        return isDisplayed(submitButton);
    }

    public boolean isSubmitButtonEnabled() {
        try {
            WebElement btn = driver.findElement(submitButton);
            String disabledAttr = btn.getAttribute("disabled");
            return disabledAttr == null || disabledAttr.equals("false");
        } catch (Exception e) {
            return false;
        }
    }

    public boolean areAllFieldsDisplayed() {
        return isDisplayed(firstNameInput)
                && isDisplayed(lastNameInput)
                && isDisplayed(phoneInput)
                && isDisplayed(emailInput)
                && isDisplayed(passwordInput)
                && isDisplayed(confirmPasswordInput);
    }

    public String getToastMessage() {
        return getOptionalText(toastNotification);
    }

    public OtpVerificationModal getOtpModal() {
        return new OtpVerificationModal(driver);
    }
}
