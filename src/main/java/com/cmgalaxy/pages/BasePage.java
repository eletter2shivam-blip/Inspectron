package com.cmgalaxy.pages;

import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.cmgalaxy.utils.WaitUtils;

public abstract class BasePage {

    protected final WebDriver driver;
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    public BasePage(WebDriver driver) {
        this.driver = driver;
    }

    protected WebElement find(By locator) {
        return WaitUtils.waitForVisibility(driver, locator);
    }

    protected WebElement findPresent(By locator) {
        return WaitUtils.waitForPresence(driver, locator);
    }

    protected void click(By locator) {
        logger.debug("Clicking on element located by: {}", locator);
        WebElement element = WaitUtils.waitForClickability(driver, locator);
        try {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", element);
            element.click();
        } catch (Exception e) {
            logger.debug("Standard click failed, executing JavaScript click for {}", locator);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
        }
    }

    protected void type(By locator, String text) {
        WebElement element = WaitUtils.waitForVisibility(driver, locator);
        element.click();
        // Clear value using backspace sequence to trigger React synthetic onChange/onBlur correctly
        element.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    protected void blur(By locator) {
        WebElement element = WaitUtils.waitForPresence(driver, locator);
        ((JavascriptExecutor) driver).executeScript("arguments[0].blur();", element);
    }

    protected String getText(By locator) {
        try {
            return WaitUtils.waitForVisibility(driver, locator).getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    protected String getAttribute(By locator, String attributeName) {
        try {
            WebElement element = WaitUtils.waitForPresence(driver, locator);
            return element.getAttribute(attributeName);
        } catch (Exception e) {
            return "";
        }
    }

    public boolean isDisplayed(By locator) {
        try {
            return driver.findElement(locator).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public String getPageTitle() {
        return driver.getTitle();
    }

    public void refresh() {
        driver.navigate().refresh();
        WaitUtils.waitForPageLoad(driver);
    }

    public void navigateBack() {
        driver.navigate().back();
        WaitUtils.waitForPageLoad(driver);
    }

    public void navigateForward() {
        driver.navigate().forward();
        WaitUtils.waitForPageLoad(driver);
    }

    public void switchToNewTab() {
        List<String> windowHandles = new ArrayList<>(driver.getWindowHandles());
        if (windowHandles.size() > 1) {
            driver.switchTo().window(windowHandles.get(windowHandles.size() - 1));
            logger.info("Switched to new tab: {}", driver.getCurrentUrl());
        }
    }

    public void closeCurrentTabAndSwitchBack() {
        List<String> windowHandles = new ArrayList<>(driver.getWindowHandles());
        if (windowHandles.size() > 1) {
            driver.close();
            driver.switchTo().window(windowHandles.get(0));
            logger.info("Closed child tab, switched back to parent window: {}", driver.getCurrentUrl());
        }
    }
}
