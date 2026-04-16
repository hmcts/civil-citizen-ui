const FAKE_CLAIM_ID = '1234567890123456';
const FAKE_GA_ID = '9876543210987654';

Feature('Payment Confirmation URL Auth Guards - DTSCCI-4177').tag('@civil-citizen-nightly @ui-payments');

Before(async ({I}) => {
  await I.clearCookie();
});

Scenario('Unauthenticated hearing fee confirmation URL redirects to login', async ({I}) => {
  await I.amOnPage(`/hearing-payment-confirmation/${FAKE_CLAIM_ID}`);
  await I.wait(2);
  await I.seeInCurrentUrl('idam');
  await I.dontSee('Your payment was');
});

Scenario('Unauthenticated claim issue fee confirmation URL redirects to login', async ({I}) => {
  await I.amOnPage(`/claim-issued-payment-confirmation/${FAKE_CLAIM_ID}`);
  await I.wait(2);
  await I.seeInCurrentUrl('idam');
  await I.dontSee('Your payment was');
});

Scenario('Unauthenticated GA fee confirmation URL redirects to login', async ({I}) => {
  await I.amOnPage(`/general-application/payment-confirmation/${FAKE_CLAIM_ID}/gaid/${FAKE_GA_ID}`);
  await I.wait(2);
  await I.seeInCurrentUrl('idam');
  await I.dontSee('Your payment was');
});

Scenario('Unauthenticated hearing fee confirmation URL with unique id redirects to login', async ({I}) => {
  await I.amOnPage(`/hearing-payment-confirmation/${FAKE_CLAIM_ID}/abc-unique-123/confirmation`);
  await I.wait(2);
  await I.seeInCurrentUrl('idam');
  await I.dontSee('Your payment was');
});

Scenario('Unauthenticated claim issue fee confirmation URL with unique id redirects to login', async ({I}) => {
  await I.amOnPage(`/claim-issued-payment-confirmation/${FAKE_CLAIM_ID}/abc-unique-456/confirmation`);
  await I.wait(2);
  await I.seeInCurrentUrl('idam');
  await I.dontSee('Your payment was');
});

Scenario('Unauthenticated GA fee confirmation URL with unique id redirects to login', async ({I}) => {
  await I.amOnPage(`/general-application/payment-confirmation/${FAKE_CLAIM_ID}/gaid/${FAKE_GA_ID}/abc-unique-789/confirmation`);
  await I.wait(2);
  await I.seeInCurrentUrl('idam');
  await I.dontSee('Your payment was');
});
