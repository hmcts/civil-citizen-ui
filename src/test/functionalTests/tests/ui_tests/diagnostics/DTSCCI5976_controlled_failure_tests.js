Feature('DTSCCI-5976 controlled functional diagnostics failure')
  .tag('@civil-citizen-pr @ui-diagnostics');

Scenario('DTSCCI-5976 controlled browser assertion failure for diagnostic evidence', async ({ I }) => {
  await I.amOnPage('/');
  await I.waitForContent('DTSCCI-5976 intentionally missing content', 1);
});
