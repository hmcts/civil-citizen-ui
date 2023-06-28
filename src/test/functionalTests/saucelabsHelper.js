const assert = require('assert');

const Helper = require('@codeceptjs/helper');

// use any assertion library you like

class MyHelper extends Helper {
  /**
   * checks that authentication cookie is set
   */
  async seeAuthentication() {
    // access current browser of WebDriver helper
    const { WebDriver } = this.helpers;
    const { browser } = WebDriver;

    // get all cookies according to https://webdriver.io/api/protocol/cookie.html
    // any helper method should return a value in order to be added to promise chain
    const res = await browser.cookie();
    // get values
    let cookies = res.value;
    for (let k in cookies) {
      // check for a cookie
      if (cookies[k].name !== 'logged_in') {
        continue;
      }
      assert.equal(cookies[k].value, 'yes');
      return;
    }
    assert.fail(cookies, 'logged_in', 'Auth cookie not set');
  }
}

module.exports = MyHelper;
