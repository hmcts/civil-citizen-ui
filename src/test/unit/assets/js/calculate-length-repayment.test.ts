import {JSDOM} from 'jsdom';
import {GenericForm} from 'common/form/models/genericForm';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {getRepaymentScheduleDisplay} from 'common/utils/repaymentUtils';
import {presentationFormContext, renderPresentation} from '../../../utils/renderPresentationPages';
import {formControlTranslate} from '../../../utils/renderFormControls';

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
          if (total > 0 && frequency) {
            expect(document.getElementById('numberOfInstalments')!.textContent).toBe(String(Math.ceil(total / 10) * (frequency === 'TWO_WEEKS' ? 2 : 1)));
            expect(visible()).toEqual([frequency === 'MONTH' ? 'months_schedule' : 'weeks_schedule']);
          } else {
            expect(document.getElementById('numberOfInstalments')!.textContent).toBe('');
            expect(visible()).toEqual([]);
          }
        });
      } finally {
        if (originalDocument) Object.defineProperty(global, 'document', originalDocument); else delete (global as unknown as {document?: Document}).document;
        dom.window.close();
      }
    }
  });

  it.each(['en', 'cy'].flatMap(language => [
    'features/claimantResponse/instalments-plan.njk',
    'features/response/repaymentPlan/repaymentPlan.njk',
  ].map(view => ({language, view}))))('updates the count and visible unit after frequency and amount changes ($language, $view)', ({language, view}) => {
    const model = new RepaymentPlanForm(100, 25, 'WEEK', '2027', '6', '12');
    const dom = new JSDOM(renderPresentation(view, {
      ...presentationFormContext(view, language), form: new GenericForm(model),
      repaymentSchedule: getRepaymentScheduleDisplay(100, 25, 'WEEK'),
    }, language));
    const document = dom.window.document;
    const translate = formControlTranslate(language);
    const originalDocument = Object.getOwnPropertyDescriptor(global, 'document');
    Object.defineProperty(document, 'readyState', {value: 'complete'});
    Object.defineProperty(global, 'document', {configurable: true, value: document});
    const expectSchedule = (count: string, id: string, translationKey: string) => {
      expect(document.getElementById('numberOfInstalments')!.textContent).toBe(count);
      const visible = Array.from(document.querySelectorAll('.schedule span:not(.hide)'));
      expect(visible.map(element => element.id)).toEqual([id]);
      expect(visible[0].textContent!.trim()).toBe(translate(translationKey));
    };
    const selectFrequency = (frequency: string) => document.querySelector<HTMLInputElement>(`input[name="repaymentFrequency"][value="${frequency}"]`)!.click();
    const changeAmount = (amount: string) => {
      const input = document.querySelector<HTMLInputElement>('.repayment-instalments')!;
      input.value = amount;
      input.dispatchEvent(new dom.window.Event('input', {bubbles: true}));
    };
    try {
      jest.isolateModules(() => {
        require('../../../../main/assets/js/calculate-length-repayment');
        expectSchedule('4', 'weeks_schedule', 'COMMON.SCHEDULE.WEEKS_LOWER_CASE');
        selectFrequency('TWO_WEEKS');
        expectSchedule('8', 'weeks_schedule', 'COMMON.SCHEDULE.WEEKS_LOWER_CASE');
        selectFrequency('MONTH');
        expectSchedule('4', 'months_schedule', 'COMMON.SCHEDULE.MONTHS_LOWER_CASE');
        changeAmount('100');
        expectSchedule('1', 'month_schedule', 'COMMON.SCHEDULE.MONTH');
        selectFrequency('WEEK');
        expectSchedule('1', 'week_schedule', 'COMMON.SCHEDULE.WEEK_LOWER_CASE');
        changeAmount('25');
        expectSchedule('4', 'weeks_schedule', 'COMMON.SCHEDULE.WEEKS_LOWER_CASE');
      });
    } finally {
      if (originalDocument) Object.defineProperty(global, 'document', originalDocument); else delete (global as unknown as {document?: Document}).document;
      dom.window.close();
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
