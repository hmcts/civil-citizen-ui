#!/usr/bin/env node
const assert = require('node:assert/strict');
const {workerPlan} = require('./functional-baseline');
const baseUrl = process.argv[2];

async function request(path, expected = 200, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {'Content-Type': 'application/json'},
    body: body && JSON.stringify(body),
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, expected, path);
  return response;
}

async function main() {
  const scripts = require('../package.json').scripts;
  const standardWorkers = Number(scripts['test:civil-citizen-pr'].match(/--suites (\d+)/)[1]);
  const optimisedWorkers = workerPlan(require('../docs/functional-baseline.json'), 'pr').workers;
  assert.ok(optimisedWorkers >= standardWorkers, 'Optimised concurrency must match or exceed standard');
  // More simultaneous payments than workers, including repeated amounts and
  // unfinished replacements for the same service request/case.
  const payments = await Promise.all(Array.from({length: optimisedWorkers * 2}, async (_, index) => {
    const amount = [455, 619, 126, 123][index % 4];
    const returnUrl = `https://example.test/payment/${index % standardWorkers}`;
    const payment = await (await request(`/service-request/case-${index % standardWorkers}/card-payments`, 201,
      {amount, currency: 'GBP', 'return-url': returnUrl})).json();
    assert.equal(payment.status, 'Initiated');
    const next = new URL(payment.next_url.replace('__WIREMOCK_PUBLIC_URL__', baseUrl));
    assert.equal(next.searchParams.get('payment_ref'), payment.payment_reference);
    assert.equal(next.searchParams.get('return_url'), returnUrl);
    assert.equal(Number(next.searchParams.get('amount')), amount === 455 ? 115 : amount);
    return {...payment, next, returnUrl, amount: amount === 455 ? 115 : amount};
  }));
  assert.equal(new Set(payments.map(p => p.payment_reference)).size, payments.length);
  async function status(payment, expected) {
    const data = await (await request(`/card-payments/${payment.payment_reference}/statuses`)).json();
    assert.equal(data.status, expected);
    assert.equal(data.reference, payment.payment_reference);
    assert.equal(data.amount, payment.amount);
    assert.deepEqual(data.status_histories.map(h => h.status), expected === 'Success' ? ['Initiated', 'Success'] : ['Initiated']);
  }
  await Promise.all(payments.map(p => status(p, 'Initiated')));
  await request(`/thin-pay/complete${payments[0].next.search}`, 404);
  // Enter/confirm pages retain the reference and do not complete payment yet.
  await Promise.all(payments.map(async payment => {
    const card = await (await request(`${payment.next.pathname}${payment.next.search}`)).text();
    assert.ok(card.includes(`name="payment_ref" value="${payment.payment_reference}"`));
    const confirm = await (await request(`/thin-pay/confirm${payment.next.search}`)).text();
    assert.ok(confirm.includes('action="/thin-pay/complete"'));
    assert.ok(confirm.includes(`name="payment_ref" value="${payment.payment_reference}"`));
    await status(payment, 'Initiated');
  }));
  const completed = payments.slice(0, optimisedWorkers);
  const unfinished = payments.slice(optimisedWorkers);
  await Promise.all(completed.reverse().map(async payment => {
    const response = await request(`/thin-pay/complete${payment.next.search}`, 303);
    assert.equal(response.headers.get('location'), payment.returnUrl);
  }));
  // A status read must not consume/reset success or affect another payment.
  for (let repeat = 0; repeat < 3; repeat++) {
    await Promise.all([...completed.map(p => status(p, 'Success')), ...unfinished.map(p => status(p, 'Initiated'))]);
  }
  const pending = unfinished[0];
  for (const path of ['/thin-pay/card', '/thin-pay/confirm', '/thin-pay/complete']) {
    const wrong = new URLSearchParams(pending.next.search);
    wrong.set('payment_ref', 'RC-THIN-CLIENT-CLAIM-00000000-0000-4000-8000-000000000000');
    await request(`${path}?${wrong}`, 404);
    wrong.set('payment_ref', pending.payment_reference);
    wrong.set('amount', '999');
    await request(`${path}?${wrong}`, 404);
    wrong.set('amount', pending.next.searchParams.get('amount'));
    wrong.set('return_url', 'https://example.test/another-case');
    await request(`${path}?${wrong}`, 404);
  }
  await request(`/thin-pay/complete${completed[0].next.search}`, 404);
  await request('/card-payments/RC-THIN-CLIENT-CLAIM-00000000-0000-4000-8000-000000000000/statuses', 404);
  await status(pending, 'Initiated');
  console.log(`Payment isolation passed for ${payments.length} interleaved payments (${optimisedWorkers} workers).`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
