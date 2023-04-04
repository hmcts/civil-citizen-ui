import {toCUIPaymentFrequency} from 'services/translation/convertToCUI/convertToCUIPaymentFrequency';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('translate Payment Frequency to CUI model', () => {
  it('should return undefined if Payment Frequency doesnt exist', () => {
    //Given
    //When
    const output = toCUIPaymentFrequency(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Payment Frequency exist one week', () => {
    //Given
    //When
    const output = toCUIPaymentFrequency(CCDPaymentFrequency.ONCE_ONE_WEEK);
    //Then
    expect(output).toEqual(TransactionSchedule.WEEK);
  });

  it('should return data if Payment Frequency exist two weeks', () => {
    //Given
    //When
    const output = toCUIPaymentFrequency(CCDPaymentFrequency.ONCE_TWO_WEEKS);
    //Then
    expect(output).toEqual(TransactionSchedule.TWO_WEEKS);
  });

  it('should return data if Payment Frequency exist two weeks', () => {
    //Given
    //When
    const output = toCUIPaymentFrequency(CCDPaymentFrequency.ONCE_TWO_WEEKS);
    //Then
    expect(output).toEqual(TransactionSchedule.TWO_WEEKS);
  });

  it('should return data if Payment Frequency exist four weeks', () => {
    //Given
    //When
    const output = toCUIPaymentFrequency(CCDPaymentFrequency.ONCE_FOUR_WEEKS);
    //Then
    expect(output).toEqual(TransactionSchedule.FOUR_WEEKS);
  });

  it('should return data if Payment Frequency exist one month', () => {
    //Given
    //When
    const output = toCUIPaymentFrequency(CCDPaymentFrequency.ONCE_ONE_MONTH);
    //Then
    expect(output).toEqual(TransactionSchedule.MONTH);
  });
});
