import {readFileSync} from 'fs';
import {join} from 'path';
import {JSDOM} from 'jsdom';

const source = readFileSync(join(__dirname, '../../../../main/assets/js/disable-submit.js'), 'utf8');

describe('payment submit protection', () => {
  let dom: JSDOM;

  function setup(pathname: string) {
    dom = new JSDOM('<form><button class="govuk-button" type="submit">Pay</button></form>', {
      url: `http://localhost${pathname}`, runScripts: 'outside-only',
    });
    dom.window.eval(source);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    const form = dom.window.document.querySelector('form')!;
    const button = form.querySelector('button')!;
    return {form, button};
  }

  afterEach(() => dom?.window.close());

  it.each([
    '/claim/12345/fee',
    '/case/99/case-progression/pay-hearing-fee/apply-help-fee-selection',
    '/case/99/case-progression/make-payment-again',
    '/case/99/general-application/apply-help-fee-selection',
    '/case/99/general-application/1/apply-help-additional-fee-selection',
  ])('disables the payment button on submission at %s', pathname => {
    const {form, button} = setup(pathname);
    expect(button.disabled).toBe(false);
    expect(form.onsubmit).toEqual(expect.any(Function));
    const event = new dom.window.Event('submit', {bubbles: true, cancelable: true});
    expect(form.dispatchEvent(event)).toBe(true);
    expect(event.defaultPrevented).toBe(false);
    expect(button.disabled).toBe(true);
  });

  it('leaves ordinary forms enabled on a non-payment path', () => {
    const {form, button} = setup('/claim/12345/details');
    expect(form.onsubmit).toBeNull();
    form.dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
    expect(button.disabled).toBe(false);
  });
});
