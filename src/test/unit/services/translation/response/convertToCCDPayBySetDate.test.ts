import {toCCDPayBySetDate, toCCDClaimantPayBySetDate} from 'services/translation/response/convertToCCDPayBySetDate';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

describe('translate Payment Deadline Date to CCD model', () => {

  it('should return deadline date if immediately', () => {
    //Given
    const deadlineDate: Date = new Date(2023, 2, 20);
    //When
    const output = toCCDPayBySetDate(undefined, PaymentOptionType.IMMEDIATELY, deadlineDate);
    //Then
    const expected = {
      whenWillThisAmountBePaid: deadlineDate,
    };
    expect(output).toEqual(expected);
  });

  it('should return payment date if pay by set date', () => {
    //Given
    const paymentDate: Date = new Date(2023, 2, 20);
    //When
    const output = toCCDPayBySetDate(paymentDate, PaymentOptionType.BY_SET_DATE, undefined);
    //Then
    const expected = {
      whenWillThisAmountBePaid: paymentDate,
    };
    expect(output).toEqual(expected);
  });
});

describe('translate Claimant PayBySetDate to CCD model', () => {

  it('should return paymentSetDate if pay by set date', () => {
    //Given
    const paymentDate: Date = new Date(2023, 11, 28);
    //When
    const output = toCCDClaimantPayBySetDate(paymentDate);
    //Then
    expect(output).not.toBeNull();
  });

  it('should return paymentSetDate if pay by set date', () => {
    //Given
    const paymentDate: Date = null;
    //When
    const output = toCCDClaimantPayBySetDate(paymentDate);
    //Then
    expect(output).toBeUndefined();
  });
});
