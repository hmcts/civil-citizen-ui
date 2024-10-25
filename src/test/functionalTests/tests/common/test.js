Feature('Smoke Test');

Scenario('Minimal test scenario to test cb @crossbrowser', async (I) => {
  I.amOnPage('/');
  I.see('Expected Page Content');
});
