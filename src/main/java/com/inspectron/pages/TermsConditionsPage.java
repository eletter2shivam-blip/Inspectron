package com.inspectron.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import com.inspectron.utils.WaitUtils;

public class TermsConditionsPage extends BasePage {

    private final By termsHeading = By.xpath("//*[contains(text(),'Terms') or contains(text(),'Conditions')]");

    public TermsConditionsPage(WebDriver driver) {
        super(driver);
    }

    public boolean isTermsPageLoaded() {
        try {
            WaitUtils.waitForUrlContains(driver, "termsconditions");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
