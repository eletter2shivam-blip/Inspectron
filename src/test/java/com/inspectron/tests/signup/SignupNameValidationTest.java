package com.inspectron.tests.signup;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import com.inspectron.base.BaseTest;
import com.inspectron.pages.SignupPage;
import com.inspectron.utils.ReportLogger;
import com.inspectron.utils.TestDataFactory;

public class SignupNameValidationTest extends BaseTest {

    @DataProvider(name = "invalidFirstNameData")
    public Object[][] invalidFirstNameDataProvider() {
        return TestDataFactory.getInvalidFirstNames();
    }

    @Test(
            dataProvider = "invalidFirstNameData",
            groups = {"negative", "validation"},
            description = "Verify First Name constraints: alphabetical only, no extra spaces, max 30 chars"
    )
    public void testFirstNameValidation(String testId, String inputName, String expectedError, String description) {
        ReportLogger.info("[" + testId + "] Testing First Name: '" + inputName + "' - " + description);
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterFirstName(inputName);
        signupPage.triggerBlurOnField("firstname");
        signupPage.clickSignUpButton();

        String actualError = signupPage.getFirstNameError();
        ReportLogger.info("[" + testId + "] Expected: '" + expectedError + "', Actual: '" + actualError + "'");
        Assert.assertEquals(actualError, expectedError, "First name validation error mismatch for: " + description);
    }

    @DataProvider(name = "invalidLastNameData")
    public Object[][] invalidLastNameDataProvider() {
        return TestDataFactory.getInvalidLastNames();
    }

    @Test(
            dataProvider = "invalidLastNameData",
            groups = {"negative", "validation"},
            description = "Verify Last Name constraints: alphabetical only, no extra spaces, max 30 chars"
    )
    public void testLastNameValidation(String testId, String inputName, String expectedError, String description) {
        ReportLogger.info("[" + testId + "] Testing Last Name: '" + inputName + "' - " + description);
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterLastName(inputName);
        signupPage.triggerBlurOnField("lastname");
        signupPage.clickSignUpButton();

        String actualError = signupPage.getLastNameError();
        ReportLogger.info("[" + testId + "] Expected: '" + expectedError + "', Actual: '" + actualError + "'");
        Assert.assertEquals(actualError, expectedError, "Last name validation error mismatch for: " + description);
    }

    @Test(
            groups = {"positive", "validation"},
            description = "CM-SIGNUP-012: Verify valid compound name with single space is accepted"
    )
    public void testValidCompoundNameAccepted() {
        ReportLogger.info("Starting test: Valid compound name with single space");
        SignupPage signupPage = new SignupPage(getDriver());
        signupPage.navigateToSignupPage();

        signupPage.enterFirstName("Mary Jane");
        signupPage.enterLastName("Van Buren");
        signupPage.triggerBlurOnField("firstname");
        signupPage.triggerBlurOnField("lastname");

        Assert.assertEquals(signupPage.getFirstNameError(), "", "No error should be displayed for valid compound first name");
        Assert.assertEquals(signupPage.getLastNameError(), "", "No error should be displayed for valid compound last name");
    }
}
