import {toCCDPaymentFrequency} from "services/translation/response/convertToCCDPaymentFrequency";
import {TransactionSchedule} from "form/models/statementOfMeans/expensesAndIncome/transactionSchedule";
import {CCDPaymentFrequency} from "models/ccdResponse/ccdPaymentFrequency";

describe('translate payment frequency to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    const output = toCCDPaymentFrequency(undefined);
    expect(output).toBe(undefined);
  });

  it('should return once a week', () => {
    const output = toCCDPaymentFrequency(TransactionSchedule.WEEK);
    expect(output).toBe(CCDPaymentFrequency.ONCE_ONE_WEEK);
  });

  it('should return once two week', () => {
    const output = toCCDPaymentFrequency(TransactionSchedule.TWO_WEEKS);
    expect(output).toBe(CCDPaymentFrequency.ONCE_TWO_WEEKS);
  });

  it('should return once four week', () => {
    const output = toCCDPaymentFrequency(TransactionSchedule.FOUR_WEEKS);
    expect(output).toBe(CCDPaymentFrequency.ONCE_FOUR_WEEKS);
  });

  it('should return once month', () => {
    const output = toCCDPaymentFrequency(TransactionSchedule.MONTH);
    expect(output).toBe(CCDPaymentFrequency.ONCE_ONE_MONTH);
  });
})
