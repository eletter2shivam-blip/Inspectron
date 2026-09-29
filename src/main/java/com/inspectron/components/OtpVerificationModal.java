package com.inspectron.components;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import com.inspectron.pages.BasePage;
import com.inspectron.utils.ReportLogger;
import com.inspectron.utils.WaitUtils;

public class OtpVerificationModal extends BasePage {

    // Verified IDs and text from live CM Galaxy bundle
    private final By modalHeading = By.xpath("//*[contains(text(),'Verify your email to create your account')]");
    private final By otp0 = By.id("otp-input-0");
    private final By otp1 = By.id("otp-input-1");
    private final By otp2 = By.id("otp-input-2");
    private final By otp3 = By.id("otp-input-3");
    private final By verifyBtn = By.xpath("//button[not(contains(text(),'Decline')) and (contains(text(),'Verify') or contains(text(),'Submit') or @type='submit')]");
    private final By declineBtn = By.xpath("//button[contains(text(),'Decline')]");
    private final By resendLink = By.xpath("//*[contains(text(),'Click to resend')]");

    public OtpVerificationModal(WebDriver driver) {
        super(driver);
    }

    public boolean isModalOpen(int timeoutSeconds) {
        try {
            WaitUtils.waitForVisibility(driver, otp0, timeoutSeconds);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public OtpVerificationModal enterOtp(String fourDigitOtp) {
        if (fourDigitOtp != null && fourDigitOtp.length() == 4) {
            ReportLogger.info("Entering 4-digit OTP: ****");
            type(otp0, String.valueOf(fourDigitOtp.charAt(0)));
            type(otp1, String.valueOf(fourDigitOtp.charAt(1)));
            type(otp2, String.valueOf(fourDigitOtp.charAt(2)));
            type(otp3, String.valueOf(fourDigitOtp.charAt(3)));
        }
        return this;
    }

    public void clickVerify() {
        ReportLogger.info("Clicking OTP Verify button");
        click(verifyBtn);
    }

    public void clickDecline() {
        ReportLogger.info("Clicking OTP Decline button");
        click(declineBtn);
    }

    public boolean isResendLinkDisplayed() {
        return isDisplayed(resendLink);
    }
}
