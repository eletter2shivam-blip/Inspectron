package com.inspectron.listeners;

import java.io.File;
import org.testng.ISuite;
import org.testng.ISuiteListener;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.inspectron.constants.FrameworkConstants;
import com.inspectron.driver.DriverManager;
import com.inspectron.utils.ScreenshotUtils;

public class TestListener implements ITestListener, ISuiteListener {

    private static ExtentReports extent;
    private static final ThreadLocal<ExtentTest> testNode = new ThreadLocal<>();

    public static ExtentTest getTest() {
        return testNode.get();
    }

    @Override
    public void onStart(ISuite suite) {
        if (extent == null) {
            File reportDir = new File(FrameworkConstants.EXTENT_REPORT_DIR);
            if (!reportDir.exists()) {
                reportDir.mkdirs();
            }

            ExtentSparkReporter sparkReporter = new ExtentSparkReporter(FrameworkConstants.EXTENT_REPORT_FILE);
            sparkReporter.config().setTheme(Theme.STANDARD);
            sparkReporter.config().setDocumentTitle("CM Galaxy Automation Report");
            sparkReporter.config().setReportName("Signup & Registration Journey Automation Test Results");
            sparkReporter.config().setTimeStampFormat("yyyy-MM-dd HH:mm:ss");

            extent = new ExtentReports();
            extent.attachReporter(sparkReporter);
            extent.setSystemInfo("Application", "CM Galaxy Marketing Platform");
            extent.setSystemInfo("Environment", "Production / Live");
            extent.setSystemInfo("Author", "Lead SDET");
            extent.setSystemInfo("OS", System.getProperty("os.name"));
            extent.setSystemInfo("Java Version", System.getProperty("java.version"));
        }
    }

    @Override
    public void onFinish(ISuite suite) {
        if (extent != null) {
            extent.flush();
        }
    }

    @Override
    public void onTestStart(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        String description = result.getMethod().getDescription();
        if (description == null || description.isEmpty()) {
            description = testName;
        }

        ExtentTest test = extent.createTest(testName, description);
        for (String group : result.getMethod().getGroups()) {
            test.assignCategory(group);
        }
        testNode.set(test);
        test.log(Status.INFO, "Started test: " + testName);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        if (testNode.get() != null) {
            testNode.get().log(Status.PASS, "Test PASSED: " + result.getMethod().getMethodName());
        }
    }

    @Override
    public void onTestFailure(ITestResult result) {
        if (testNode.get() != null) {
            String testName = result.getMethod().getMethodName();
            testNode.get().log(Status.FAIL, "Test FAILED: " + testName);
            if (result.getThrowable() != null) {
                testNode.get().log(Status.FAIL, result.getThrowable());
            }

            try {
                String base64 = ScreenshotUtils.captureScreenshotBase64(DriverManager.getDriver());
                if (base64 != null && !base64.isEmpty()) {
                    testNode.get().fail("Failure Screenshot",
                            MediaEntityBuilder.createScreenCaptureFromBase64String(base64).build());
                }
            } catch (Exception e) {
                testNode.get().log(Status.WARNING, "Failed to attach screenshot to report: " + e.getMessage());
            }
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        if (testNode.get() != null) {
            testNode.get().log(Status.SKIP, "Test SKIPPED: " + result.getMethod().getMethodName());
            if (result.getThrowable() != null) {
                testNode.get().log(Status.SKIP, result.getThrowable().getMessage());
            }
        }
    }

    @Override
    public void onFinish(ITestContext context) {
        testNode.remove();
    }
}
