import {JSDOM} from 'jsdom';
import {readFileSync} from 'fs';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {CitizenDob} from 'common/form/models/citizenDob';
import {CitizenDate} from 'common/form/models/claim/claimant/citizenDate';
import {DOBDate} from 'common/form/models/claim/claimant/dobDate';
import {DefendantDOB} from 'common/models/claimantResponse/ccj/defendantDOB';
import {DateOfBirth} from 'common/models/claimantResponse/ccj/dateOfBirth';
import {PaymentDate} from 'common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {DefendantPaymentDate} from 'common/form/models/admission/partialAdmission/defendantPaymentDate';
import {DefendantFinalPaymentDate} from 'common/form/models/certOfSorC/defendantFinalPaymentDate';
import {AcceptDefendantOffer, ProposedPaymentPlanOption} from 'common/models/generalApplication/response/acceptDefendantOffer';
import {YesNo} from 'common/form/models/yesNo';
import {formControlContext} from '../../../utils/renderFormControls';
import {renderProductionPage} from '../../../utils/renderProductionPage';

type DateParts = {year: string; month: string; day: string};
const future = {year: '2099', month: '1', day: '12'};
const past = {year: '2000', month: '1', day: '12'};
const cases = [
  {name: 'defendant DOB', view: 'response/citizenDob/citizen-dob', property: 'dateOfBirth', date: future,
    model: ({year, month, day}: DateParts) => new CitizenDob(year, month, day)},
  {name: 'claimant DOB', view: 'response/citizenDob/citizen-dob', property: 'date', date: {year: '2015', month: '1', day: '12'}, locals: {claimantView: true},
    model: ({year, month, day}: DateParts) => new DOBDate(day, month, year)},
  {name: 'paid in full', view: 'claimantResponse/paidInFull/date-paid', property: 'date', date: future,
    model: ({year, month, day}: DateParts) => new CitizenDate(day, month, year)},
  {name: 'CCJ defendant DOB', view: 'claimantResponse/ccj/defendant-dob', property: 'dob[dateOfBirth]', date: future, nested: true,
    model: (date: DateParts) => new DefendantDOB(YesNo.YES, new DateOfBirth(date))},
  {name: 'full admission, CCJ and claimant payment date', view: 'response/admission/payment-date', property: 'date', date: past,
    model: ({year, month, day}: DateParts) => new PaymentDate(year, month, day)},
  {name: 'partial admission payment date', view: 'response/admission/payment-date', property: 'date', date: {year: '2026', month: '11', day: '10'},
    model: ({year, month, day}: DateParts) => new DefendantPaymentDate(year, month, day)},
  {name: 'COSC final payment date', view: 'generalApplication/certOfSorC/final-payment-date', property: 'date', date: future,
    model: ({year, month, day}: DateParts) => new DefendantFinalPaymentDate(year, month, day)},
  {name: 'GA proposed payment date', view: 'generalApplication/response/accept-defendant-offer', property: 'proposedSetDate', date: past,
    model: ({year, month, day}: DateParts) => new AcceptDefendantOffer(YesNo.NO, ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE, undefined, undefined, year, month, day)},
];

describe.each(cases)('$name error-summary focus through the production layout', scenario => {
  let dom: JSDOM;
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-11-03T12:00:00Z')));
  afterEach(() => {
    dom?.window.close();
    jest.useRealTimers();
  });

  function render(date: DateParts, language: string) {
    const form = new GenericForm<object>(scenario.model(date));
    form.validateSync();
    const originalErrors = form.getAllErrors();
    const view = `features/${scenario.view}.njk`;
    dom = new JSDOM(renderProductionPage(view, formControlContext(view, language, 'error', {
      ...scenario.locals, form,
    }), language), {runScripts: 'outside-only'});
    expect(form.getAllErrors()).toEqual(originalErrors);
    const {window} = dom;
    const doc = window.document;
    doc.body.classList.add('govuk-frontend-supported');
    // Only scrolling is unavailable in JSDOM; GOV.UK event handling and focus are real.
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    window.eval(readFileSync(require.resolve('govuk-frontend/dist/govuk/components/error-summary/error-summary.bundle.js'), 'utf8'));
    const {ErrorSummary} = (window as unknown as {GOVUKFrontend: {ErrorSummary: new (root: Element, options: {disableAutoFocus: boolean}) => unknown}}).GOVUKFrontend;
    expect(doc.querySelectorAll('.govuk-error-summary')).toHaveLength(1);
    new ErrorSummary(doc.querySelector('.govuk-error-summary'), {disableAutoFocus: true});
    return {form, doc};
  }

  function activate(doc: Document, field: string) {
    const link = [...doc.querySelectorAll<HTMLAnchorElement>('.govuk-error-summary a')]
      .find(anchor => anchor.getAttribute('href') === `#${field}`);
    expect(link).toBeDefined();
    link.focus();
    link.click();
    const input = doc.getElementById(field) as HTMLInputElement | HTMLTextAreaElement;
    expect(['INPUT', 'TEXTAREA']).toContain(input.tagName);
    expect(doc.activeElement).toBe(input);
    return input;
  }

  it.each(['en', 'cy'])('focuses the day for a whole-date error and preserves submitted values in %s', language => {
    const {form, doc} = render(scenario.date, language);
    expect(form.getAllErrors().some(error => error.property === scenario.property && error.text)).toBe(true);
    const day = scenario.nested ? 'dob[day]' : 'day';
    expect(activate(doc, day).value).toBe(scenario.date.day);
    expect([...doc.querySelectorAll<HTMLInputElement>('.govuk-date-input input')].map(input => [input.name, input.value]))
      .toEqual(['day', 'month', 'year'].map(field => [scenario.nested ? `dob[${field}]` : field, scenario.date[field as keyof DateParts]]));
    expect(doc.querySelector('.govuk-error-summary').textContent).not.toContain('{{');
    if (scenario.property === 'proposedSetDate') {
      // A separate missing reason must retain its own link, despite the date remapping.
      expect(activate(doc, 'reasonProposedSetDate').value).toBe('');
      expect(doc.querySelector<HTMLInputElement>('input[name="option"]:checked').value).toBe(YesNo.NO);
      expect(doc.querySelector<HTMLInputElement>('input[name="type"]:checked').value).toBe(ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE);
    }
  });

  it.each(['en', 'cy'])('keeps an individual month error linked to the month in %s', language => {
    const {doc} = render({...scenario.date, month: '13'}, language);
    expect(activate(doc, scenario.nested ? 'dob[month]' : 'month').value).toBe('13');
  });
});

it.each(['en', 'cy'])('retains the default dashboard summary for other controls in %s', language => {
  const form = new GenericForm(new GenericYesNo());
  form.validateSync();
  expect(form.hasErrors()).toBe(true);
  const dom = new JSDOM(renderProductionPage('features/generalApplication/agree-to-order.njk', {form}, language));
  try {
    expect(dom.window.document.querySelectorAll('.govuk-error-summary')).toHaveLength(1);
    expect(dom.window.document.querySelector('.govuk-error-summary a[href="#option"]')).not.toBeNull();
  } finally {
    dom.window.close();
  }
});
