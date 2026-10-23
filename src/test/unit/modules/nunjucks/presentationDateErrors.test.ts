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
