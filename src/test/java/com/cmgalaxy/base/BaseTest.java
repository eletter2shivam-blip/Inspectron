package com.cmgalaxy.base;

import org.openqa.selenium.WebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import com.cmgalaxy.config.ConfigurationManager;
import com.cmgalaxy.driver.DriverFactory;
import com.cmgalaxy.driver.DriverManager;
import com.cmgalaxy.listeners.TestListener;
import com.cmgalaxy.utils.ScreenshotUtils;

@Listeners(TestListener.class)
public abstract class BaseTest {

    protected final Logger logger = LoggerFactory.getLogger(getClass());

    @BeforeMethod(alwaysRun = true)
    @Parameters({"browser", "headless"})
    public void setUp(@Optional("") String browserParam, @Optional("") String headlessParam) {
        String browser = (browserParam != null && !browserParam.isEmpty())
                ? browserParam
                : ConfigurationManager.getBrowser();

        boolean headless = (headlessParam != null && !headlessParam.isEmpty())
                ? Boolean.parseBoolean(headlessParam)
                : ConfigurationManager.isHeadless();

        logger.info("Setting up WebDriver: browser={}, headless={}", browser, headless);
        WebDriver driver = DriverFactory.createDriver(browser, headless);
        DriverManager.setDriver(driver);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        WebDriver driver = DriverManager.getDriver();
        if (driver != null) {
            try {
                if (result.getStatus() == ITestResult.FAILURE) {
                    String testName = result.getMethod().getMethodName();
                    ScreenshotUtils.captureScreenshot(driver, testName);
                }
            } catch (Exception e) {
                logger.error("Error during teardown screenshot capture", e);
            } finally {
                logger.info("Quitting WebDriver instance for test: {}", result.getMethod().getMethodName());
                driver.quit();
                DriverManager.unload();
            }
        }
    }

    protected WebDriver getDriver() {
        return DriverManager.getDriver();
    }
}
