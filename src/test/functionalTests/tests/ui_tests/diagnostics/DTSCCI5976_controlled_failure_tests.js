Feature('DTSCCI-5976 controlled functional diagnostics failure')
  .tag('@civil-citizen-pr @ui-diagnostics');

Scenario('DTSCCI-5976 controlled browser assertion failure for diagnostic evidence', async ({ I }) => {
  await I.amOnPage('/');
  throw new Error('DTSCCI-5976 controlled functional diagnostics failure');
}).tag('@ui-diagnostics-assertion');

Scenario('DTSCCI-5976 controlled selector timeout for diagnostic evidence', async ({ I }) => {
  await I.amOnPage('/');
  await I.waitForElement('#dtscci-5976-controlled-missing-element', 2);
}).tag('@ui-diagnostics-selector-timeout');

Scenario('DTSCCI-5976 controlled CUI HTTP 500 signal for diagnostic evidence', async ({ I }) => {
  await I.amOnPage('/');
  throw new Error('Expected status: 200, actual status: 500, message: Internal Server Error, url: /dtscci-5976-controlled-http-500');
}).tag('@ui-diagnostics-http-500');

Scenario('DTSCCI-5976 controlled unmatched WireMock request for diagnostic evidence', async ({ I }) => {
  await I.amOnPage('/');

  if (!process.env.WIREMOCK_URL) {
    throw new Error('DTSCCI-5976 controlled unmatched WireMock request requires WIREMOCK_URL');
  }

  const unmatchedUrl = `${process.env.WIREMOCK_URL.replace(/\/$/, '')}/dtscci-5976-unmatched-${Date.now()}`;
  await fetch(unmatchedUrl).catch(() => undefined);

  throw new Error(`DTSCCI-5976 controlled unmatched WireMock request generated at ${unmatchedUrl}`);
}).tag('@ui-diagnostics-wiremock-unmatched');

Scenario('DTSCCI-5976 controlled browser infrastructure termination signal for diagnostic evidence', async ({ I }) => {
  await I.amOnPage('/');
  throw new Error('browser crash or infrastructure termination: Target page, context or browser has been closed');
}).tag('@ui-diagnostics-browser-crash');
