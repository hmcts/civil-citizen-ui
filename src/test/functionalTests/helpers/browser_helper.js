module.exports = class BrowserHelpers extends Helper {

  getHelper() {
    return this.helpers['Playwright'] || this.helpers['WebDriver'];
  }

  isPlaywright() {
    return !!this.helpers['Playwright'];
  }

  isWebDriver() {
    return !!this.helpers['WebDriver'];
  }

  /**
   * Finds elements described by selector.
   * If element cannot be found an empty collection is returned.
   *
   * @param selector - element selector
   * @returns {Promise<Array>} - promise holding either collection of elements or empty collection if element is not found
   */
  async locateSelector(selector) {
    return this.getHelper()._locate(selector);
  }

  async hasSelector(selector) {
    return (await this.locateSelector(selector)).length;
  }

  /**
   * Finds element described by locator.
   * If element cannot be found immediately function waits specified amount of time or globally configured `waitForTimeout` period.
   * If element still cannot be found after the waiting time an undefined is returned.
   *
   * @param locator - element CSS locator
   * @param sec - optional time in seconds to wait
   * @returns {Promise<undefined|*>} - promise holding either an element or undefined if element is not found
   */
  async waitForSelector(locator, sec) {
    const helper = this.getHelper();
    const waitTimeout = sec ? sec * 1000 : helper.options.waitForTimeout;
    try {
      if (this.isPlaywright()) {
        const context = await helper._getContext();
        return await context.waitForSelector(locator, {timeout: waitTimeout});
      } else {
        return await helper.waitForElement(locator, waitTimeout);
      }
    } catch (error) {
      return undefined;
    }
  }

  async waitForContent(content, sec) {
    const helper = this.getHelper();
    const waitTimeout = sec ? sec * 1000 : helper.options.waitForTimeout * 1000;

    try {
      if (this.isPlaywright()) {
        const context = await helper._getContext();
        return await context.waitForVisible(`//*[contains(text(), ${content})]`, waitTimeout);
      } else if (this.isWebDriver()) {
        return await helper.waitForText(content, sec, 'body');
      } else {
        throw new Error('Helper not recognized. This function supports Playwright and WebDriver.');
      }
    } catch (error) {
      return undefined;
    }
  }

  async handleKnownErrorsAndGoBack(customErrors = []) {
    const errorsToCheck = [
      'Something went wrong',
      '504 Gateway Time-out',
      ...customErrors,
    ];

    let pageContent = '';
    const page = await this.helpers.Playwright.page;
    const driver = this.helpers.WebDriver;

    if (this.isPlaywright()) {
      pageContent = await page.content();
    } else if (this.isWebDriver()) {
      pageContent = await driver.grabSource();
    }

    const matchedError = errorsToCheck.find(text => pageContent.includes(text));

    if (matchedError) {
      console.log(`Detected error: ${matchedError}. Going back...`);

      if (this.isPlaywright()) {
        await page.goBack();
      } else {
        await driver.browser.back();
      }

      return true;
    }

    return false;
  }

  async clickClaimNumber(claimNumber, retries = 2) {
    if (!this.isPlaywright()) {
      await this.getHelper().click(claimNumber);
      return;
    }

    const page = this.helpers.Playwright.page;
    const claimLink = page.locator(`//a[normalize-space()="${claimNumber}"]`).first();
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await claimLink.click();
      } catch (err) {
        lastError = err;
        console.log(`Claim click attempt ${attempt + 1}/${retries + 1} failed: ${err.message}`);
        await page.waitForTimeout(500);
        continue;
      }

      await page.waitForTimeout(1);
      if (!await this.handleKnownErrorsAndGoBack()) {
        return;
      }

      console.log(`Retrying claim click (${attempt + 1}/${retries})...`);
    }

    throw lastError || new Error(`Failed to click claim number ${claimNumber}`);
  }

  async clickWithRetry(selectorOrButtonName, retries = 1) {
    if (!this.isPlaywright()) {
      await this.getHelper().click(selectorOrButtonName);
      return;
    }

    const page = this.helpers.Playwright.page;
    const selector = String(selectorOrButtonName);
    const looksLikeLocator = selector.startsWith('//')
      || selector.startsWith('xpath=')
      || selector.startsWith('#')
      || selector.startsWith('.')
      || selector.startsWith('[')
      || selector.includes(',')
      || selector.includes('>')
      || selector.includes(':')
      || selector.includes('=');
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (looksLikeLocator) {
          // Use Playwright's native locator so grouped CSS selectors
          // (e.g. "a, b, c") are parsed as CSS rather than fuzzy text/XPath,
          // and `.first()` keeps it strict-mode safe when several match.
          await page.locator(selector).first().click();
        } else {
          // Support existing callers that pass visible button text.
          await page.locator(`//button[contains(normalize-space(), '${selector}')]`).first().click();
        }
      } catch (err) {
        lastError = err;
        console.log(`Click attempt ${attempt + 1}/${retries + 1} failed: ${err.message}`);
        await page.waitForTimeout(500);
        continue;
      }

      await page.waitForTimeout(1);

      const hasError = await this.handleKnownErrorsAndGoBack();
      if (!hasError) {
        return;
      }

      console.log(`Retrying click (${attempt + 1}/${retries})...`);
    }

    throw lastError || new Error(`Failed after ${retries} retries due to repeated error page`);
  }
};
