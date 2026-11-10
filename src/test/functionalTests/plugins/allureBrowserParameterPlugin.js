const event = require('codeceptjs').event;
const allure = require('allure-js-commons');

// Adds the browser engine (FUNCTIONAL_TEST_BROWSER) to each test's Allure result as a parameter. Allure groups results
// by test name and parameters, so when the nightly runs the suite once in each browser, each browser's result is shown
// as its own test rather than as a retry of the same test.
module.exports = function () {
  const browser = process.env.FUNCTIONAL_TEST_BROWSER;
  if (!browser) {
    return;
  }

  // Registered after the allure plugin, so its listener has already started the test's Allure result
  event.dispatcher.on(event.test.before, async () => {
    await allure.parameter('browser', browser);
  });
};
