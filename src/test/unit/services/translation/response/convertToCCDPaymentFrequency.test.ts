import {toCCDPaymentFrequency} from 'services/translation/response/convertToCCDPaymentFrequency';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';

describe('translate payment frequency to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    //When
    const output = toCCDPaymentFrequency(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return once a week', () => {
    //Given
    //When
    const output = toCCDPaymentFrequency(TransactionSchedule.WEEK);
    //Then
    expect(output).toBe(CCDPaymentFrequency.ONCE_ONE_WEEK);
  });

  it('should return once two week', () => {
    //Given
    //When
    const output = toCCDPaymentFrequency(TransactionSchedule.TWO_WEEKS);
    //Then
    expect(output).toBe(CCDPaymentFrequency.ONCE_TWO_WEEKS);
  });

  it('should return once four week', () => {
    //Given
    //When
    const output = toCCDPaymentFrequency(TransactionSchedule.FOUR_WEEKS);
    //Then
    expect(output).toBe(CCDPaymentFrequency.ONCE_FOUR_WEEKS);
  });

  it('should return once month', () => {
    //Given
    //When
    const output = toCCDPaymentFrequency(TransactionSchedule.MONTH);
    //Then
    expect(output).toBe(CCDPaymentFrequency.ONCE_ONE_MONTH);
  });
});
