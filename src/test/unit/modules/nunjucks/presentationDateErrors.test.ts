import {readFileSync} from 'fs';
import {JSDOM} from 'jsdom';
import {GenericForm} from 'common/form/models/genericForm';
import {FlightDetails} from 'models/flightDetails';
import {RepaymentPlanForm} from 'form/models/repaymentPlan/repaymentPlanForm';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {AgreedResponseDeadline} from 'form/models/agreedResponseDeadline';
import {RepaymentPlanInstalments} from 'models/claimantResponse/ccj/repaymentPlanInstalments';
import {InstalmentFirstPaymentDate} from 'models/claimantResponse/ccj/instalmentFirstPaymentDate';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {presentationFormContext, renderPresentation} from '../../../utils/renderPresentationPages';
import {CreateQuery} from 'models/queryManagement/createQuery';
import {uploadContext} from '../../../utils/renderUploadForms';
import {formControlTranslate} from '../../../utils/renderFormControls';

const cases = [
  ['features/claim/airlines/flight-details.njk', () => new FlightDetails('Air Example', 'AB1', '2099', '1', '12'), 'day'],
  ['features/claimantResponse/instalments-plan.njk', () => new RepaymentPlanForm(100, 25, 'MONTH', '2010', '1', '12'), 'day'],
  ['features/response/repaymentPlan/repaymentPlan.njk', () => new RepaymentPlanForm(100, 25, 'MONTH', '2010', '1', '12'), 'day'],
  ['features/response/admission/how-much-have-you-paid.njk', () => new HowMuchHaveYouPaid({amount: 25, totalClaimAmount: 100, year: '2099', month: '1', day: '12', text: 'Details'}), 'day'],
  ['features/response/responseDeadline/agreed-response-deadline.njk', () => new AgreedResponseDeadline('2010', '1', '12', new Date(2026, 9, 19)), 'day'],
  ['features/claimantResponse/ccj/repayment-plan-instalments.njk', () => new RepaymentPlanInstalments('25', new InstalmentFirstPaymentDate({day: '12', month: '1', year: '2010'}), TransactionSchedule.MONTH, 100), 'firstPaymentDate[day]'],
] as const;

it.each(cases)('model-level date errors activate the actual day field: %s', (view, model, dayId) => {
  for (const language of ['en', 'cy']) {
    const form = new GenericForm(model()); form.validateSync(); expect(form.hasErrors()).toBe(true);
    const dom = new JSDOM(renderPresentation(view, {...presentationFormContext(view, language), form}, language), {runScripts: 'outside-only'});
    try {
      const {window} = dom; const document = window.document;
      window.HTMLElement.prototype.scrollIntoView = jest.fn();
      document.body.classList.add('govuk-frontend-supported');
      window.eval(readFileSync(require.resolve('govuk-frontend/dist/govuk/components/error-summary/error-summary.bundle.js'), 'utf8'));
      const {ErrorSummary} = (window as unknown as {GOVUKFrontend: {ErrorSummary: new (root: Element, config: {disableAutoFocus: boolean}) => unknown}}).GOVUKFrontend;
      new ErrorSummary(document.querySelector('.govuk-error-summary')!, {disableAutoFocus: true});
      const link = Array.from(document.querySelectorAll<HTMLAnchorElement>('.govuk-error-summary a')).find(a => a.getAttribute('href') === '#' + dayId);
      expect(link).toBeDefined(); link!.focus(); link!.click(); expect(document.activeElement).toBe(document.getElementById(dayId));
      expect((document.activeElement as HTMLInputElement).value).toBe('12');
      expect(document.querySelector('.govuk-error-message .govuk-error-message')).toBeNull();
    } finally {dom.window.close();}
  }
});

it.each([
  {year: '', month: '', day: '', target: 'day'},
  {year: '2099', month: '2', day: '40', target: 'day'},
  {year: '10', month: '13', day: '40', target: 'day'},
])('query date errors use one escaped paragraph and activate a real input: %p', ({year, month, day, target}) => {
  for (const language of ['en', 'cy']) {
    const form = new GenericForm(new CreateQuery('Subject', 'Details', 'yes', year, month, day));
    form.validateSync();
    expect(form.hasErrors()).toBe(true);
    const messages = form.getAllErrors().map(error => formControlTranslate(language)(error.text));
    const dom = new JSDOM(renderPresentation('features/queryManagement/createQuery.njk', {...uploadContext(language), form}, language), {runScripts: 'outside-only'});
    try {
      const {window} = dom; const document = window.document;
      const inline = document.getElementById('date-error')!;
      expect(inline).not.toBeNull();
      expect(inline.querySelector('p, .govuk-error-message')).toBeNull();
      const visible = inline.cloneNode(true) as Element;
      visible.querySelector('.govuk-visually-hidden')?.remove();
      expect(visible.textContent!.replace(/\s+/g, ' ').trim()).toBe(messages.join(' '));
      expect(document.querySelectorAll('.govuk-error-message')).toHaveLength(1);
      expect(document.querySelector(`#${target}`)!.closest('fieldset')!.getAttribute('aria-describedby')).toContain('date-error');
      window.HTMLElement.prototype.scrollIntoView = jest.fn();
      document.body.classList.add('govuk-frontend-supported');
      window.eval(readFileSync(require.resolve('govuk-frontend/dist/govuk/components/error-summary/error-summary.bundle.js'), 'utf8'));
      const {ErrorSummary} = (window as unknown as {GOVUKFrontend: {ErrorSummary: new (root: Element, config: {disableAutoFocus: boolean}) => unknown}}).GOVUKFrontend;
      new ErrorSummary(document.querySelector('.govuk-error-summary')!, {disableAutoFocus: true});
      const link = document.querySelector<HTMLAnchorElement>(`.govuk-error-summary a[href="#${target}"]`)!;
      expect(link).not.toBeNull(); link.focus(); link.click();
      expect(document.activeElement).toBe(document.getElementById(target));
      expect(document.querySelector('input[name="day"]')!.getAttribute('value')).toBe(String(form.model.day));
    } finally {dom.window.close();}
  }
});

it('escapes query date messages before composing trusted line breaks', () => {
  const form = new GenericForm(new CreateQuery('Subject', 'Details', 'yes', '10', '13', '40'));
  form.validateSync();
  const translate = formControlTranslate('en');
  const t = (key: string) => key === 'ERRORS.QUERY_MANAGEMENT.VALID_DAY' ? 'Bad <em>day</em> & details' : translate(key);
  const dom = new JSDOM(renderPresentation('features/queryManagement/createQuery.njk', {...uploadContext(), form, t}));
  try {
    const inline = dom.window.document.getElementById('date-error')!;
    expect(inline.textContent).toContain('Bad <em>day</em> & details');
    expect(inline.querySelector('em, p')).toBeNull();
    expect(inline.querySelectorAll('br')).toHaveLength(2);
  } finally {dom.window.close();}
});
