import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaim} from 'models/civilClaimResponse';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';
import {toCUICCJRequest} from 'services/translation/convertToCUI/convertToCUICCJRequest';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';

describe('translate CCJ Request to CUI model', () => {

  it('should convert all if partialPayment is YES', () => {
    //Given
    const ccdClaimMock : CCDClaim = {
      partialPayment: YesNoUpperCamelCase.YES,
      partialPaymentAmount: '12345',
      paymentTypeSelection: CCDDJPaymentOption.REPAYMENT_PLAN,
    };
    //When
    const output = toCUICCJRequest(ccdClaimMock);
    //ccdClaimMock
    const expected = new CCJRequest();
    expected.paidAmount = new PaidAmount(YesNo.YES, 123.45);
    expected.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.INSTALMENTS);
    expect(output).toEqual(expected);
  });

  it('should not convert amount if partialPayment is NO', () => {
    //Given
    const ccdClaimMock : CCDClaim = {
      partialPayment: YesNoUpperCamelCase.NO,
      paymentTypeSelection: CCDDJPaymentOption.SET_DATE,
    };
    //When
    const output = toCUICCJRequest(ccdClaimMock);
    //ccdClaimMock
    const expected = new CCJRequest();
    expected.paidAmount = new PaidAmount(YesNo.NO);
    expected.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.BY_SET_DATE);
    expect(output).toEqual(expected);
  });

  it('should return data if everything is filled and partialPayment YES', () => {
    //Given
    const ccdClaimMock : CCDClaim = {
      partialPayment: YesNoUpperCamelCase.YES,
      partialPaymentAmount: '10000',
      paymentTypeSelection: CCDDJPaymentOption.IMMEDIATELY,
    };
    //When
    const output = toCUICCJRequest(ccdClaimMock);
    //ccdClaimMock
    const expected = new CCJRequest();
    expected.paidAmount = new PaidAmount(YesNo.YES, 100);
    expected.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.IMMEDIATELY);
    expect(output).toEqual(expected);
  });
});
