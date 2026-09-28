package com.cmgalaxy.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import com.cmgalaxy.utils.WaitUtils;

public class PrivacyPolicyPage extends BasePage {

    private final By privacyHeading = By.xpath("//*[contains(text(),'Privacy') or contains(text(),'Policy')]");

    public PrivacyPolicyPage(WebDriver driver) {
        super(driver);
    }

    public boolean isPrivacyPageLoaded() {
        try {
            WaitUtils.waitForUrlContains(driver, "privacypolicy");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
