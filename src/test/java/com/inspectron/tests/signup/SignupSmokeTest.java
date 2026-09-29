package com.inspectron.tests.signup;

import org.testng.Assert;
import org.testng.annotations.Test;
import com.inspectron.base.BaseTest;
import com.inspectron.components.OtpVerificationModal;
import com.inspectron.constants.FrameworkConstants;
import com.inspectron.constants.ValidationMessages;
import com.inspectron.models.UserRegistrationData;
import com.inspectron.pages.SignupPage;
import com.inspectron.utils.ReportLogger;
import com.inspectron.utils.TestDataFactory;

public class SignupSmokeTest extends BaseTest {

    @Test(
            groups = {"smoke", "positive"},
            description = "CM-SIGNUP-001 & 002: Verify Signup page loads with correct URL and Title"
    )
    public void testSignupPageLoadsSuccessfully() {
        ReportLogger.info("Starting smoke test: Verify Signup page loads");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        String currentUrl = signupPage.getCurrentUrl();
        ReportLogger.info("Current page URL: " + currentUrl);
        Assert.assertTrue(currentUrl.contains("/sign-up"), "URL should contain /sign-up, but found: " + currentUrl);

        String pageTitle = signupPage.getPageTitle();
        ReportLogger.info("Current page title: " + pageTitle);
        Assert.assertEquals(pageTitle, FrameworkConstants.EXPECTED_PAGE_TITLE, "Page title mismatch");
    }

    @Test(
            groups = {"smoke", "ui"},
            description = "CM-SIGNUP-003, 004, 006: Verify all signup inputs and submit button are displayed"
    )
    public void testAllFieldsAndButtonsDisplayed() {
        ReportLogger.info("Starting smoke test: Verify all fields and buttons are displayed");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        Assert.assertTrue(signupPage.areAllFieldsDisplayed(), "All 6 registration input fields must be visible");
        Assert.assertTrue(signupPage.isSubmitButtonDisplayed(), "Sign Up submit button must be displayed");
    }

    @Test(
            groups = {"smoke", "negative", "validation"},
            description = "CM-SIGNUP-067: Verify submitting blank form displays all required error messages"
    )
    public void testBlankFormSubmissionTriggersRequiredValidation() {
        ReportLogger.info("Starting smoke test: Verify submitting blank form triggers required field errors");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.clickSignUpButton();

        Assert.assertEquals(signupPage.getFirstNameError(), ValidationMessages.REQUIRED_FIRST_NAME, "First name required error mismatch");
        Assert.assertEquals(signupPage.getLastNameError(), ValidationMessages.REQUIRED_LAST_NAME, "Last name required error mismatch");
        Assert.assertEquals(signupPage.getPhoneError(), ValidationMessages.PHONE_DIGITS_RANGE, "Phone required error mismatch");
        Assert.assertEquals(signupPage.getEmailError(), ValidationMessages.REQUIRED_EMAIL, "Email required error mismatch");
        Assert.assertEquals(signupPage.getPasswordError(), ValidationMessages.REQUIRED_PASSWORD, "Password required error mismatch");
        Assert.assertEquals(signupPage.getConfirmPasswordError(), ValidationMessages.REQUIRED_CONFIRM_PASSWORD, "Confirm password required error mismatch");
    }

    @Test(
            groups = {"smoke", "positive"},
            description = "CM-SIGNUP-069: Verify successful registration initiation with dynamically generated unique data"
    )
    public void testValidUserSignupInitiation() {
        ReportLogger.info("Starting positive end-to-end test: Unique user registration initiation");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        UserRegistrationData uniqueUser = TestDataFactory.generateUniqueUser();
        ReportLogger.info("Registering unique user: " + uniqueUser.getEmail());

        signupPage.fillRegistrationForm(uniqueUser);
        signupPage.clickSignUpButton();

        OtpVerificationModal otpModal = signupPage.getOtpModal();
        boolean modalOpened = otpModal.isModalOpen(15);
        ReportLogger.info("OTP verification modal opened: " + modalOpened);

        Assert.assertTrue(modalOpened, "OTP Verification Modal should open upon submitting valid unique registration");
    }
}
