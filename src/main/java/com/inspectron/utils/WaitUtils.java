package com.inspectron.utils;

import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.inspectron.config.ConfigurationManager;

public final class WaitUtils {

    private static final Logger logger = LoggerFactory.getLogger(WaitUtils.class);

    private WaitUtils() {
    }

    private static WebDriverWait getWait(WebDriver driver, int timeoutInSeconds) {
        return new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
    }

    private static WebDriverWait getDefaultWait(WebDriver driver) {
        return getWait(driver, ConfigurationManager.getExplicitWait());
    }

    public static WebElement waitForVisibility(WebDriver driver, By locator) {
        return waitForVisibility(driver, locator, ConfigurationManager.getExplicitWait());
    }

    public static WebElement waitForVisibility(WebDriver driver, By locator, int timeoutInSeconds) {
        logger.debug("Waiting for visibility of element located by: {} within {}s", locator, timeoutInSeconds);
        return getWait(driver, timeoutInSeconds).until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public static WebElement waitForVisibility(WebDriver driver, WebElement element) {
        return getDefaultWait(driver).until(ExpectedConditions.visibilityOf(element));
    }

    public static WebElement waitForPresence(WebDriver driver, By locator) {
        return getDefaultWait(driver).until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    public static WebElement waitForClickability(WebDriver driver, By locator) {
        return getDefaultWait(driver).until(ExpectedConditions.elementToBeClickable(locator));
    }

    public static WebElement waitForClickability(WebDriver driver, WebElement element) {
        return getDefaultWait(driver).until(ExpectedConditions.elementToBeClickable(element));
    }

    public static boolean waitForInvisibility(WebDriver driver, By locator) {
        return getDefaultWait(driver).until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public static boolean waitForUrlContains(WebDriver driver, String partialUrl) {
        return getDefaultWait(driver).until(ExpectedConditions.urlContains(partialUrl));
    }

    public static boolean waitForTitleContains(WebDriver driver, String titleFraction) {
        return getDefaultWait(driver).until(ExpectedConditions.titleContains(titleFraction));
    }

    public static List<WebElement> waitForAllElementsVisible(WebDriver driver, By locator) {
        return getDefaultWait(driver).until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
    }

    public static void waitForPageLoad(WebDriver driver) {
        getDefaultWait(driver).until((ExpectedCondition<Boolean>) wd -> {
            assert wd != null;
            return ((JavascriptExecutor) wd).executeScript("return document.readyState").equals("complete");
        });
    }

    public static WebElement fluentWaitForElement(WebDriver driver, By locator, int timeoutSeconds, int pollingMillis) {
        FluentWait<WebDriver> wait = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(timeoutSeconds))
                .pollingEvery(Duration.ofMillis(pollingMillis))
                .ignoring(NoSuchElementException.class)
                .ignoring(StaleElementReferenceException.class);

        return wait.until(d -> d.findElement(locator));
    }
}
