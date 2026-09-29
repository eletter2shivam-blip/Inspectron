class AutomationExporter {
  /**
   * Generate Playwright TypeScript test spec
   */
  generatePlaywright(testCase) {
    const sanitizeName = (str = '') => str.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const testTitle = testCase.title || testCase.scenario || 'Test Scenario';
    const steps = Array.isArray(testCase.steps) ? testCase.steps : (testCase.steps || '').split('\n');

    return `import { test, expect } from '@playwright/test';

/**
 * Test Case: ${testCase.test_case_id || 'TC-001'} - ${testTitle}
 * Module: ${testCase.module || 'Default'}
 * Priority: ${testCase.priority || 'P2-High'}
 * Preconditions: ${testCase.preconditions || 'None'}
 */
test.describe('${testCase.module || 'General'} - ${testCase.feature || 'Feature'}', () => {
  test('${testTitle.replace(/'/g, "\\'")}', async ({ page }) => {
    // Preconditions: ${testCase.preconditions || 'N/A'}
    
    // Steps:
${steps.map((step, i) => `    // Step ${i + 1}: ${step}\n    // await page.locator('...').action();`).join('\n')}

    // Assert Expected Result:
    // ${testCase.expected_result}
    // await expect(page.locator('text=${testCase.expected_result.slice(0, 30)}')).toBeVisible();
  });
});
`;
  }

  /**
   * Generate Selenium Java test with TestNG
   */
  generateSeleniumJava(testCase) {
    const className = (testCase.module || 'Regression') + 'Test';
    const methodName = 'test_' + (testCase.test_case_id || 'TC001').replace(/[^a-zA-Z0-9]/g, '_');
    const steps = Array.isArray(testCase.steps) ? testCase.steps : (testCase.steps || '').split('\n');

    return `package com.inspectron.qa.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ID: ${testCase.test_case_id || 'TC-001'}
 * Module: ${testCase.module || 'Core'}
 * Preconditions: ${testCase.preconditions || 'None'}
 */
public class ${className} {
    private WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @Test(priority = 1, description = "${testCase.title ? testCase.title.replace(/"/g, '\\"') : 'Test'}")
    public void ${methodName}() {
        // Precondition: ${testCase.preconditions}
        
${steps.map(s => `        // ${s}\n        // driver.findElement(By.id("...")).click();`).join('\n')}

        // Verify: ${testCase.expected_result}
        // Assert.assertTrue(driver.findElement(By.cssSelector(".alert-success")).isDisplayed());
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
`;
  }

  /**
   * Generate Cypress JavaScript spec
   */
  generateCypress(testCase) {
    const steps = Array.isArray(testCase.steps) ? testCase.steps : (testCase.steps || '').split('\n');

    return `describe('${testCase.module || 'Suite'} - ${testCase.feature || 'Feature'}', () => {
  it('${(testCase.title || 'Scenario').replace(/'/g, "\\'")}', () => {
    // Preconditions: ${testCase.preconditions || 'N/A'}
    
${steps.map(s => `    // ${s}\n    // cy.get('[data-testid="..."]').should('exist');`).join('\n')}

    // Assert: ${testCase.expected_result}
    // cy.contains('${(testCase.expected_result || '').slice(0, 30)}').should('be.visible');
  });
});
`;
  }

  /**
   * Generate RestAssured Java API test
   */
  generateRestAssured(apiTest) {
    const method = (apiTest.method || 'GET').toLowerCase();
    const endpoint = apiTest.endpoint || '/api';
    const status = apiTest.expected_status_code || 200;

    return `package com.inspectron.qa.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class Api${(apiTest.api_test_id || 'Test').replace(/[^a-zA-Z0-9]/g, '')} {

    @Test
    public void testEndpoint() {
        RestAssured.baseURI = "https://api.inspectron.io";

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer \${AUTH_TOKEN}")
            .body("${JSON.stringify(apiTest.request_body || {}).replace(/"/g, '\\"')}")
        .when()
            .${method}("${endpoint}")
        .then()
            .statusCode(${status})
            .contentType(ContentType.JSON);
    }
}
`;
  }

  /**
   * Generate Postman Collection v2.1 JSON
   */
  generatePostmanCollection(apiTests = [], collectionName = 'AI QA Assistant API Collection') {
    const itemArray = apiTests.map((test, index) => {
      const method = (test.method || 'GET').toUpperCase();
      const rawUrl = test.endpoint?.startsWith('http') ? test.endpoint : `{{baseUrl}}${test.endpoint || '/api'}`;

      return {
        name: `${test.api_test_id || `API-${index + 1}`} - ${method} ${test.endpoint}`,
        request: {
          method: method,
          header: [
            { key: 'Content-Type', value: 'application/json', type: 'text' },
            { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }
          ],
          body: ['POST', 'PUT', 'PATCH'].includes(method) ? {
            mode: 'raw',
            raw: JSON.stringify(test.request_body || {}, null, 2),
            options: { raw: { language: 'json' } }
          } : undefined,
          url: {
            raw: rawUrl,
            host: ['{{baseUrl}}'],
            path: (test.endpoint || '').split('/').filter(Boolean)
          },
          description: `Validation: ${test.validation}\nExpected Status: ${test.expected_status_code}\nPriority: ${test.priority}`
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: (test.postman_script || `pm.test("Status code is ${test.expected_status_code || 200}", function () {
    pm.response.to.have.status(${test.expected_status_code || 200});
});`).split('\n')
            }
          }
        ]
      };
    });

    return {
      info: {
        _postman_id: `col-${Date.now()}`,
        name: collectionName,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        description: 'Auto-generated API Test Collection by AI QA Assistant'
      },
      item: itemArray,
      variable: [
        { key: 'baseUrl', value: 'https://api.inspectron.io', type: 'string' },
        { key: 'token', value: 'mock_jwt_token', type: 'string' }
      ]
    };
  }
}

module.exports = new AutomationExporter();
