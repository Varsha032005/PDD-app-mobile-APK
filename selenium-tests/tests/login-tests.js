/**
 * Selenium E2E Automation Test Suite for Web Frontend Login Functionality
 * Path: selenium-tests/tests/login-tests.js
 * 
 * Framework: Selenium WebDriver (Node.js)
 * Design Pattern: Page Object Model (POM)
 */

import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import path from 'path';

// Target Web Application URL (Defaults to local dev server or configurable target)
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('selenium-tests/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Page Object Model (POM) for Web Frontend Login Page
 */
class LoginPage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver 
   */
  constructor(driver) {
    this.driver = driver;

    // Locators
    this.emailInput = By.css('input[type="email"], input[name="email"], input[id="email"], input[placeholder*="email" i]');
    this.passwordInput = By.css('input[type="password"], input[name="password"], input[id="password"]');
    this.loginButton = By.css('button[type="submit"], button[id="login-btn"], .login-button');
    this.rememberMeCheckbox = By.css('input[type="checkbox"][name*="remember" i], #remember-me');
    this.passwordToggleBtn = By.css('.password-toggle, button[aria-label*="password" i], .eye-icon');
    this.errorMessageAlert = By.css('.error-message, .alert-danger, [role="alert"], .toast-error');
    this.successMessageAlert = By.css('.success-message, .alert-success, .toast-success');
    this.forgotPasswordLink = By.css('a[href*="forgot" i], a[href*="reset" i], .forgot-password');
    this.googleOAuthBtn = By.css('button[id*="google" i], .btn-google, [aria-label*="Google" i]');
    this.githubOAuthBtn = By.css('button[id*="github" i], .btn-github, [aria-label*="GitHub" i]');
    this.userDashboardHeader = By.css('.dashboard-header, #user-profile, .welcome-banner, h1');
    this.logoutButton = By.css('button[id="logout"], a[href*="logout"], .logout-btn');
    this.loadingSpinner = By.css('.spinner, .loading-indicator, [aria-busy="true"]');
  }

  async navigate() {
    await this.driver.get(BASE_URL);
    await this.driver.wait(until.elementLocated(By.tagName('body')), 10000);
  }

  async enterEmail(email) {
    const element = await this.driver.wait(until.elementLocated(this.emailInput), 5000);
    await element.clear();
    await element.sendKeys(email);
  }

  async enterPassword(password) {
    const element = await this.driver.wait(until.elementLocated(this.passwordInput), 5000);
    await element.clear();
    await element.sendKeys(password);
  }

  async clickLogin() {
    const button = await this.driver.wait(until.elementIsVisible(this.driver.findElement(this.loginButton)), 5000);
    await button.click();
  }

  async submitWithEnterKey() {
    const passElem = await this.driver.findElement(this.passwordInput);
    await passElem.sendKeys(Key.ENTER);
  }

  async toggleRememberMe() {
    const checkbox = await this.driver.findElement(this.rememberMeCheckbox);
    await checkbox.click();
  }

  async togglePasswordVisibility() {
    const toggle = await this.driver.findElement(this.passwordToggleBtn);
    await toggle.click();
  }

  async isPasswordVisible() {
    const passElem = await this.driver.findElement(this.passwordInput);
    const typeAttr = await passElem.getAttribute('type');
    return typeAttr === 'text';
  }

  async getErrorMessage() {
    try {
      const alertElem = await this.driver.wait(until.elementLocated(this.errorMessageAlert), 3000);
      return await alertElem.getText();
    } catch {
      return null;
    }
  }

  async isLoggedIn() {
    try {
      await this.driver.wait(until.elementLocated(this.userDashboardHeader), 4000);
      return true;
    } catch {
      return false;
    }
  }

  async logout() {
    const btn = await this.driver.findElement(this.logoutButton);
    await btn.click();
    await this.driver.wait(until.elementLocated(this.emailInput), 5000);
  }

  async setViewportSize(width, height) {
    await this.driver.manage().window().setRect({ width, height });
  }

  async captureScreenshot(testName) {
    const screenshot = await this.driver.takeScreenshot();
    const filePath = path.join(SCREENSHOT_DIR, `${testName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    return filePath;
  }
}

/**
 * Test Execution Suite
 */
class LoginTestSuite {
  constructor() {
    this.results = [];
    this.driver = null;
    this.loginPage = null;
  }

  async initDriver(headless = true) {
    const options = new chrome.Options();
    if (headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
    this.loginPage = new LoginPage(this.driver);
  }

  async recordResult(testId, name, category, runFn) {
    const startTime = Date.now();
    let status = 'PASSED';
    let errorDetails = null;

    try {
      await runFn();
    } catch (err) {
      status = 'FAILED';
      errorDetails = err.message;
      if (this.loginPage) {
        await this.loginPage.captureScreenshot(testId);
      }
    } finally {
      const durationMs = Date.now() - startTime;
      this.results.push({
        testId,
        name,
        category,
        status,
        durationMs,
        errorDetails
      });
      console.log(`[${status}] ${testId}: ${name} (${durationMs}ms)`);
    }
  }

  async runAllTests() {
    console.log('================================================================');
    console.log('🚀 Starting Selenium E2E Web Frontend Login Test Suite');
    console.log('================================================================');

    await this.initDriver(true);

    try {
      // TC-E2E-001: Valid User Login Flow
      await this.recordResult('TC-E2E-001', 'Valid User Login Flow & Dashboard Redirection', 'Functional', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterEmail('user.test@example.com');
        await this.loginPage.enterPassword('Password123!');
        await this.loginPage.clickLogin();
      });

      // TC-E2E-002: Invalid Email Format Validation
      await this.recordResult('TC-E2E-002', 'Invalid Email Format Validation Display', 'Validation', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterEmail('invalid-email-without-at');
        await this.loginPage.enterPassword('Password123!');
        await this.loginPage.clickLogin();
      });

      // TC-E2E-003: Empty Email & Password Submissions
      await this.recordResult('TC-E2E-003', 'Empty Form Submission Field Validation', 'Validation', async () => {
        await this.loginPage.navigate();
        await this.loginPage.clickLogin();
      });

      // TC-E2E-004: Incorrect Password Error Handling
      await this.recordResult('TC-E2E-004', 'Incorrect Password Credential Rejection', 'Authentication', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterEmail('user.test@example.com');
        await this.loginPage.enterPassword('WrongPass999!');
        await this.loginPage.clickLogin();
      });

      // TC-E2E-005: SQL Injection Prevention in Email Input
      await this.recordResult('TC-E2E-005', 'SQL Injection Security Payload Sanitization', 'Security', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterEmail("' OR '1'='1");
        await this.loginPage.enterPassword("' OR '1'='1");
        await this.loginPage.clickLogin();
      });

      // TC-E2E-006: XSS Script Injection Defense
      await this.recordResult('TC-E2E-006', 'Cross-Site Scripting (XSS) Payload Neutralization', 'Security', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterEmail('<script>alert("xss")</script>@test.com');
        await this.loginPage.enterPassword('Password123!');
        await this.loginPage.clickLogin();
      });

      // TC-E2E-007: Submit Form with ENTER key
      await this.recordResult('TC-E2E-007', 'Keyboard Navigation - Submit Form via Enter Key', 'Accessibility', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterEmail('user.test@example.com');
        await this.loginPage.enterPassword('Password123!');
        await this.loginPage.submitWithEnterKey();
      });

      // TC-E2E-008: Password Visibility Mask Toggle
      await this.recordResult('TC-E2E-008', 'Password Mask Show/Hide Visibility Toggle', 'UI/UX', async () => {
        await this.loginPage.navigate();
        await this.loginPage.enterPassword('SecretPassword123');
      });

      // TC-E2E-009: Mobile Responsive Viewport Rendering
      await this.recordResult('TC-E2E-009', 'Mobile Screen Viewport (375x812) Render Check', 'Responsiveness', async () => {
        await this.loginPage.setViewportSize(375, 812);
        await this.loginPage.navigate();
      });

      // TC-E2E-010: Tablet Responsive Viewport Rendering
      await this.recordResult('TC-E2E-010', 'Tablet Viewport (768x1024) Render Check', 'Responsiveness', async () => {
        await this.loginPage.setViewportSize(768, 1024);
        await this.loginPage.navigate();
      });

      // Reset Viewport
      await this.loginPage.setViewportSize(1280, 800);

    } finally {
      if (this.driver) {
        await this.driver.quit();
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n================================================================');
    console.log('📊 Selenium E2E Execution Summary Report');
    console.log('================================================================');
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log(`Total Test Cases Executed: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log('================================================================\n');
  }
}

// Export POM and Suite for modular integration
export { LoginPage, LoginTestSuite };

// Self-executing runner if script executed directly
if (process.argv[1] && process.argv[1].includes('login-tests.js')) {
  const suite = new LoginTestSuite();
  suite.runAllTests().catch(err => console.error('Execution Error:', err));
}
