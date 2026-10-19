import {JSDOM} from 'jsdom';
import {GenericForm} from 'common/form/models/genericForm';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {getRepaymentScheduleDisplay} from 'common/utils/repaymentUtils';
import {presentationFormContext, renderPresentation} from '../../../utils/renderPresentationPages';

const cases = [
  [100, 100, 'WEEK', '1', 'week_schedule'], [100, 150, 'MONTH', '1', 'month_schedule'],
  [100, 50, 'WEEK', '', 'two-weeks_schedule'], [100, 50, 'MONTH', '', 'two-months_schedule'],
  [100, 25, 'WEEK', '4', 'weeks_schedule'], [100, 30, 'MONTH', '4', 'months_schedule'],
  [100, 100, 'TWO_WEEKS', '', 'two-weeks_schedule'], [100, 50, 'TWO_WEEKS', '4', 'weeks_schedule'],
  [100.01, 25, 'TWO_WEEKS', '10', 'weeks_schedule'], [100, 0, 'MONTH', '', ''],
  [0, 25, 'WEEK', '', ''], [100, NaN, 'WEEK', '', ''], [100, 25, '', '', ''],
] as const;

describe('repayment display progressive enhancement', () => {
  it.each(cases)('server and enhanced display agree: %s / %s / %s', (total, payment, frequency, count, schedule) => {
    for (const language of ['en', 'cy']) {
      const model = new RepaymentPlanForm(total, payment, frequency, '2027', '6', '12');
      const display = getRepaymentScheduleDisplay(total, payment, frequency);
      expect(display).toEqual(schedule ? {numberOfInstalments: count, visibleScheduleId: schedule} : undefined);
      const html = renderPresentation('features/claimantResponse/instalments-plan.njk', {...presentationFormContext('features/claimantResponse/instalments-plan.njk', language), form: new GenericForm(model), repaymentSchedule: display}, language);
      const dom = new JSDOM(html); const document = dom.window.document;
      const visible = () => Array.from(document.querySelectorAll('.schedule span:not(.hide)')).map(element => element.id);
      expect(visible()).toEqual(schedule ? [schedule] : []);
      Object.defineProperty(document, 'readyState', {value: 'complete'});
      const originalDocument = Object.getOwnPropertyDescriptor(global, 'document');
      Object.defineProperty(global, 'document', {configurable: true, value: document});
      try {
        jest.isolateModules(() => {
          const {initRepaymentLength} = require('../../../../main/assets/js/calculate-length-repayment');
          initRepaymentLength(); initRepaymentLength();
          expect(document.getElementById('numberOfInstalments')!.textContent).toBe(count);
          expect(visible()).toEqual(schedule ? [schedule] : []);
          (document.querySelector('.repayment-instalments') as HTMLInputElement).value = '10';
          document.querySelector('.repayment-instalments')!.dispatchEvent(new dom.window.Event('input', {bubbles: true}));
          if (total > 0 && frequency) expect(document.getElementById('numberOfInstalments')!.textContent).toBe(String(Math.ceil(total / 10) * (frequency === 'TWO_WEEKS' ? 2 : 1)));
        });
      } finally {
        if (originalDocument) Object.defineProperty(global, 'document', originalDocument); else delete (global as unknown as {document?: Document}).document;
        dom.window.close();
      }
    }
  });
  it('ignores an incomplete page and also initialises after the load event', () => {
    const dom = new JSDOM('<p>Unrelated page</p>');
    const descriptor = Object.getOwnPropertyDescriptor(global, 'document');
    Object.defineProperty(global, 'document', {configurable: true, value: dom.window.document});
    Object.defineProperty(dom.window.document, 'readyState', {value: 'complete'});
    try {jest.isolateModules(() => {const {initRepaymentLength} = require('../../../../main/assets/js/calculate-length-repayment'); expect(() => initRepaymentLength()).not.toThrow();});}
    finally {if (descriptor) Object.defineProperty(global, 'document', descriptor); else delete (global as unknown as {document?: Document}).document; dom.window.close();}
  });
});
