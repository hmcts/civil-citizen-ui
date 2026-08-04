const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const chai = require('chai');

const { assert } = chai;
const LIMIT = 20;
const claimType = 'SmallClaims';
let claimRef, cookieHeader;

const uploadUrl = () => `${process.env.TEST_URL}/case/${claimRef}/general-application/upload-documents`;

const send = (url, method) =>
  fetch(url, {
    method,
    redirect: 'manual',
    headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
    body: method === 'POST' ? '{}' : undefined,
  }).then(r => ({ status: r.status, retryAfter: r.headers.get('retry-after'), rlLimit: r.headers.get('ratelimit-limit') }))
    .catch(() => ({ status: 0 }));

const burst = (url, method, count) => Promise.all(Array.from({ length: count }, () => send(url, method)));

Feature('LipvLip GA upload rate limiting - DTSCCI-5582').tag('@civil-citizen-nightly @ui-ga');

Before(async ({ I, api }) => {
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  const cookie = await I.grabCookie('citizen-ui-session');
  cookieHeader = `${cookie.name}=${cookie.value}`;
});

Scenario('positive - 50 concurrent uploads: only the limit gets through, the rest return 429', async () => {
  const results = await burst(uploadUrl(), 'POST', 50);
  const throttled = results.filter(r => r.status === 429);
  const allowed = results.filter(r => r.status !== 429 && r.status !== 0);

  assert.isAtMost(allowed.length, LIMIT, 'no more than the configured limit may pass');
  assert.isAtLeast(throttled.length, 25, 'the concurrent burst must be throttled');
  assert.isTrue(throttled.every(r => Number(r.retryAfter) > 0), 'every 429 must carry a Retry-After header');
  assert.isTrue(results.some(r => r.rlLimit !== null), 'standard RateLimit-* headers must be present');
});

Scenario('negative - concurrent GET requests are not rate limited', async () => {
  const results = await burst(uploadUrl(), 'GET', 50);
  assert.equal(results.filter(r => r.status === 429).length, 0, 'GET (non-POST) must never be throttled');
});

Scenario('negative - POSTs to a non-upload route are not rate limited', async () => {
  const results = await burst(`${process.env.TEST_URL}/dashboard`, 'POST', 50);
  assert.equal(results.filter(r => r.status === 429).length, 0, 'the limiter must only apply to upload endpoints');
});

Scenario('edge - the atomic counter trips at the limit boundary (sequential)', async () => {
  const results = [];
  for (let i = 0; i < LIMIT + 5; i++) {
    results.push(await send(uploadUrl(), 'POST'));
  }
  const firstThrottled = results.findIndex(r => r.status === 429);

  assert.notEqual(firstThrottled, -1, 'a 429 must appear once over the limit');
  assert.isAtLeast(firstThrottled, LIMIT, 'the first 20 requests must be allowed before any 429');
});
