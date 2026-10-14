import {JSDOM} from 'jsdom';
import {readFileSync} from 'fs';
import path from 'path';
import {GenericForm} from 'common/form/models/genericForm';
import {CitizenDob} from 'common/form/models/citizenDob';
import {CitizenDate} from 'common/form/models/claim/claimant/citizenDate';
import {formControlForm, formControlPages, formControlTranslate, renderFormControlPage} from '../../../utils/renderFormControls';
import type {FormControlState} from '../../../utils/renderFormControls';

const dateViews = formControlPages.filter(view => /citizen-dob|date-paid|defendant-dob|payment-date|accept-defendant-offer/.test(view));

describe.each(formControlPages)('real form-control caller %s', view => {
  let dom: JSDOM;
  afterEach(() => dom?.window.close());
  describe.each(['en', 'cy'])('%s', language => {
    it.each<FormControlState>(['blank', 'yes', 'no', 'error'])('preserves fields, legends and associations for %s', state => {
      dom = new JSDOM(renderFormControlPage(view, language, state));
      const doc = dom.window.document;
      expect(doc.querySelector('form')?.getAttribute('method')).toBe('post');
      expect(doc.querySelector<HTMLInputElement>('input[name="_csrf"]')?.value).toBe('fixture-csrf');
      const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
      expect(new Set(ids).size).toBe(ids.length);
      doc.querySelectorAll<HTMLLabelElement>('label[for]').forEach(label => expect(doc.getElementById(label.htmlFor)).not.toBeNull());
      doc.querySelectorAll('[aria-describedby], [aria-labelledby], [data-aria-controls]').forEach(element => {
        for (const attr of ['aria-describedby', 'aria-labelledby', 'data-aria-controls']) {
          element.getAttribute(attr)?.split(/\s+/).filter(Boolean).forEach(id => expect(doc.getElementById(id)).not.toBeNull());
        }
      });
      const option = doc.querySelector<HTMLInputElement>('input[type=radio][name=option]');
      if (option) {
        // This caller changes only its date error; its separate radio contract is deferred.
        if (!view.includes('accept-defendant-offer')) expect(option.closest('fieldset')?.querySelector('legend')?.textContent.trim()).toBeTruthy();
        const selected = doc.querySelector<HTMLInputElement>('input[name=option]:checked');
        expect(selected?.value).toBe(state === 'blank' ? undefined : state === 'no' ? 'no' : 'yes');
      }
      expect(doc.querySelector('.govuk-error-message .govuk-error-message')).toBeNull();
      doc.querySelectorAll<HTMLAnchorElement>('.govuk-error-summary a[href^="#"]').forEach(link => expect(doc.getElementById(link.getAttribute('href').slice(1))).not.toBeNull());
      if (state === 'error') expect(doc.querySelector('.govuk-error-message')?.textContent).toContain(formControlTranslate(language)(dateViews.includes(view) ? 'ERRORS.VALID_DAY' : 'ERRORS.VALID_YES_NO_OPTION'));
      // These are the original submit names and order, including conditional DOB.
      if (dateViews.includes(view)) {
        const prefix = view.includes('defendant-dob') ? 'dob[' : '';
        const names = [...doc.querySelectorAll<HTMLInputElement>('.govuk-date-input input')].map(input => input.name);
        expect(names).toEqual(['day', 'month', 'year'].map(name => prefix ? `${prefix}${name}]` : name));
        expect([...doc.querySelectorAll<HTMLInputElement>('.govuk-date-input input')].map(input => input.value)).toEqual(state === 'blank' ? ['', '', ''] : ['12', '6', '1980']);
      }
    });
  });
});

describe('date error composition and master content preservation', () => {
  let dom: JSDOM;
  afterEach(() => dom?.window.close());
  it.each(dateViews)('keeps multiple messages ordered and escaped on %s', view => {
    const nested = view.includes('defendant-dob');
    const errors = nested ? {'dob[day]': 'ERRORS.VALID_DAY', 'dob[month]': 'ERRORS.VALID_MONTH'} : {day: 'ERRORS.VALID_DAY', month: 'ERRORS.VALID_MONTH'};
    const form = formControlForm({option: 'yes', day: 32, month: 13, year: 1980, dob: {day: 32, month: 13, year: 1980}}, errors);
    dom = new JSDOM(renderFormControlPage(view, 'en', 'error', {form}));
    const error = dom.window.document.querySelector('.govuk-date-input')?.parentElement.querySelector('.govuk-error-message');
    const translate = formControlTranslate();
    expect(error?.textContent).toContain(translate('ERRORS.VALID_DAY'));
    expect(error?.textContent.indexOf(translate('ERRORS.VALID_DAY'))).toBeLessThan(error?.textContent.indexOf(translate('ERRORS.VALID_MONTH')));
    expect(error?.querySelector('.govuk-error-message')).toBeNull();
  });
  it('escapes translated date errors before composing trusted line breaks', () => {
    const view = 'features/generalApplication/response/accept-defendant-offer.njk';
    const form = formControlForm({option: 'no', type: 'PROPOSE_BY_SET_DATE'}, {day: 'ERRORS.VALID_DAY'});
    const translate = formControlTranslate();
    const translatedError = '<img src=x onerror=alert(1) alt="">';
    dom = new JSDOM(renderFormControlPage(view, 'en', 'error', {form, t: (key: string) => key === 'ERRORS.VALID_DAY' ? translatedError : translate(key)}));
    const error = dom.window.document.getElementById('proposedSetDate-error');
    expect(error).not.toBeNull();
    expect(error.querySelector('img')).toBeNull();
    expect(error.textContent).toContain(translatedError);
  });
  it.each(['en', 'cy'])('preserves interpolated DOB maximum dates in %s', language => {
    const form = formControlForm({day: 1, month: 1, year: 2020}, {dateOfBirth: 'ERRORS.VALID_ENTER_A_DATE_BEFORE'});
    dom = new JSDOM(renderFormControlPage('features/response/citizenDob/citizen-dob.njk', language, 'error', {form}));
    const error = dom.window.document.getElementById('date-error');
    expect(error?.textContent).toContain('15');
    expect(error?.textContent).toContain('2008');
    expect(error?.textContent).not.toContain('{{');
  });
  it('does not translate missing proposed-date messages', () => {
    const translate = formControlTranslate();
    const form = formControlForm({option: 'no', type: 'PROPOSE_BY_SET_DATE'}, {day: 'ERRORS.VALID_DAY'});
    dom = new JSDOM(renderFormControlPage('features/generalApplication/response/accept-defendant-offer.njk', 'en', 'error', {form, t: (key: string) => {
      if (!key) throw new Error('Missing translation key');
      return translate(key);
    }}));
    expect(dom.window.document.getElementById('proposedSetDate-error')?.textContent).toContain(translate('ERRORS.VALID_DAY'));
  });
  it.each(['en', 'cy'])('focuses the day input when activating real model-level date errors in %s', language => {
    for (const [view, model] of [
      ['features/response/citizenDob/citizen-dob.njk', new CitizenDob('2099', '1', '12')],
      ['features/claimantResponse/paidInFull/date-paid.njk', new CitizenDate('12', '1', '2099')],
    ] as const) {
      const form = new GenericForm(model);
      form.validateSync();
      expect(form.hasErrors()).toBe(true);
      const rendered = new JSDOM(renderFormControlPage(view, language, 'error', {form}), {runScripts: 'outside-only'});
      try {
        const {window} = rendered;
        const doc = window.document;
        doc.body.classList.add('govuk-frontend-supported');
        // JSDOM has no scrolling implementation; focus and GOV.UK event handling remain real.
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
        window.eval(readFileSync(require.resolve('govuk-frontend/dist/govuk/components/error-summary/error-summary.bundle.js'), 'utf8'));
        const {ErrorSummary} = (window as unknown as {GOVUKFrontend: {ErrorSummary: new (root: Element, options: {disableAutoFocus: boolean}) => unknown}}).GOVUKFrontend;
        new ErrorSummary(doc.querySelector('.govuk-error-summary'), {disableAutoFocus: true});
        const link = doc.querySelector<HTMLAnchorElement>('.govuk-error-summary a');
        link.focus();
        link.click();
        expect(doc.activeElement).toBe(doc.querySelector('input#day'));
        expect(link.getAttribute('href')).toBe('#day');
        expect(doc.querySelector<HTMLInputElement>('input#day').value).toBe('12');
      } finally { rendered.window.close(); }
    }
  });
  it('does not create an empty conditional date error for an option-only error', () => {
    dom = new JSDOM(renderFormControlPage('features/claimantResponse/ccj/defendant-dob.njk', 'en', 'error', {form: formControlForm({dob: {}}, {option: 'ERRORS.VALID_YES_NO_OPTION'})}));
    expect(dom.window.document.getElementById('dob[dateOfBirth]-error')).toBeNull();
    expect(dom.window.document.getElementById('option-error')).not.toBeNull();
  });
  it.each(['en', 'cy'])('retains approved Help with Fees content and conditional reference in %s', language => {
    const view = 'features/public/eligibility/help-with-fees-reference.njk';
    dom = new JSDOM(renderFormControlPage(view, language, 'yes'));
    expect(dom.window.document.querySelector('input[name=hwfReferenceNumber]')).not.toBeNull();
    expect(dom.window.document.querySelector('a[href="https://www.gov.uk/get-help-with-court-fees"]')).not.toBeNull();
    expect(dom.window.document.body.textContent).toContain(formControlTranslate(language)('PAGES.ELIGIBILITY_HWF_REFERENCE.WHEN_YOU_APPLY'));
  });
});

describe('refreshed captures use their actual caller\'s group ownership', () => {
  const cases = [
    ['case-progression-apply-help-with-fees-reference-number', 'caseProgression/hearingFee/apply-help-fee-reference', 'input[name="option"]'],
    ['case-progression-apply-help-with-fees', 'helpWithFees/help-fees-start', 'input[name="option"]'],
    ['case-progression-finalise-trial-arrangements-has-anything-changed', 'caseProgression/trialArrangements/has-anything-changed', 'input[name="option"]'],
    ['general-application-1720536653906339-apply-help-with-fees', 'generalApplication/applicationFee/help-with-application-fee', 'input[name="option"]'],
    ['general-application-1720536653906339-apply-help-with-fees-reference-number', 'generalApplication/applicationFee/help-with-application-fee-reference', 'input[name="option"]'],
    ['response-full-admission-payment-date', 'response/admission/payment-date', '.govuk-date-input input'],
    ['response-partial-admission-payment-date', 'response/admission/payment-date', '.govuk-date-input input'],
  ];
  it.each(cases)('%s', (capture, view, selector) => {
    const filename = path.resolve(__dirname, '../../../utils/mocks/a11y', `mock-case-1645882162449409-${capture}.html`);
    const captured = new JSDOM(readFileSync(filename, 'utf8'));
    const actual = new JSDOM(renderFormControlPage(`features/${view}.njk`));
    try {
      const group = (doc: Document) => {
        const control = doc.querySelector<HTMLInputElement>(selector);
        const fieldset = control.closest('fieldset');
        const legend = fieldset.querySelector('legend');
        return {
          legend: legend.textContent.replace(/\s+/g, ' ').trim(),
          legendClasses: [...legend.classList].sort(),
          ownsFormGroup: fieldset.contains(control.closest('.govuk-form-group')),
          formFieldsets: control.form.querySelectorAll('fieldset').length,
        };
      };
      expect(group(captured.window.document)).toEqual(group(actual.window.document));
      if (view === 'response/admission/payment-date') {
        expect(captured.window.document.querySelector('h1').className).toBe(actual.window.document.querySelector('h1').className);
      }
    } finally {
      captured.window.close();
      actual.window.close();
    }
  });
});
