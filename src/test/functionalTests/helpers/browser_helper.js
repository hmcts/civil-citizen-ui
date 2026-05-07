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
      ...customErrors
    ];

    let pageContent = '';

    if (this.isPlaywright()) {
      const page = this.helpers.Playwright.page;
      pageContent = await page.content();
    } else if (this.isWebDriver()) {
      pageContent = await helper.grabSource();
    }

    const matchedError = errorsToCheck.find(text =>
      pageContent.includes(text)
    );

    if (matchedError) {
      console.log(`Detected error: ${matchedError}. Going back...`);

      if (this.isPlaywright()) {
        const page = await helper.page;
        await page.goBack();
      } else {
        await helper.browser.back();
      }

      return true;
    }

    return false;
  }

  async clickWithRetry(selector, retries = 1) {
    if (this.isPlaywright()) {
      const page = this.helpers.Playwright.page;
      for (let attempt = 0; attempt <= retries; attempt++) {
        await page.locator(selector).click();
        await page.waitForTimeout(1);

        const hasError = await this.handleKnownErrorsAndGoBack();

        if (!hasError) {
          return;
        }

        console.log(`Retrying click (${attempt + 1}/${retries})...`);
    }
    
    }

    throw new Error(`Failed after ${retries} retries due to repeated error page`);
  }
};
