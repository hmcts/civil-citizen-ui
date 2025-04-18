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
};
