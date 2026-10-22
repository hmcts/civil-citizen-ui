import {DateConverter} from 'common/utils/dateConverter';
import {PartialAdmissionRepaymentPlanForm} from 'form/models/admission/partialAdmission/partialAdmissionRepaymentPlan';

describe('PartialAdmissionRepaymentPlanForm', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12)); });
  afterEach(() => { jest.useRealTimers(); });

  it('should initialise base fields and first repayment date', () => {
    const form = new PartialAdmissionRepaymentPlanForm(1000, 50, 'WEEK', '2026', '08', '20');

    expect(form.totalClaimAmount).toBe(1000);
    expect(form.paymentAmount).toBe(50);
    expect(form.repaymentFrequency).toBe('WEEK');
    expect(form.year).toBe(2026);
    expect(form.month).toBe(8);
    expect(form.day).toBe(20);
    expect(form.firstRepaymentDate).toEqual(DateConverter.convertToDate('2026', '08', '20'));
    expect(form.calculateFirstPaymentDate).toBeInstanceOf(Date);
  });

  it('should set calculateFirstPaymentDate about 30 days from today', () => {
    const form = new PartialAdmissionRepaymentPlanForm();
    const expected = new Date();
    expected.setDate(expected.getDate() + 30);

    expect(form.calculateFirstPaymentDate.toDateString()).toBe(expected.toDateString());
  });

  it('should leave first repayment date undefined when date parts are missing', () => {
    const form = new PartialAdmissionRepaymentPlanForm(500);

    expect(form.firstRepaymentDate).toBeUndefined();
  });
});
