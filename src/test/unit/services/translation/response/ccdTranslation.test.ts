import PaymentOptionType from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from '../../../../../main/common/models/claim';
import {translateDraftResponseToCCD} from '../../../../../main/services/translation/response/ccdTranslation';
import {CCDPaymentOption} from '../../../../../main/common/models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from "../../../../../main/common/models/ccdResponse/ccdRepaymentPlan";

describe('translate response to ccd version', ()=> {
  it('should translate payment option to ccd', ()=> {
    //Given
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.BY_SET_DATE;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim);
    //Then
    expect(ccdResponse.paymentTypeSelection).toBe(CCDPaymentOption.SET_DATE);
  });
  it('should translate repayment plan to ccd', () => {
    //Given
    const claim = new Claim();
    claim.repaymentPlan = {
      paymentAmount: 100,
      firstRepaymentDate: new Date(),
      repaymentFrequency: 'MONTH',
    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim);
    //Then
    expect(ccdResponse.respondent1RepaymentPlan).not.toBeUndefined();
    expect(ccdResponse.respondent1RepaymentPlan?.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
    expect(ccdResponse.respondent1RepaymentPlan?.firstRepaymentDate).toBe(claim.repaymentPlan.firstRepaymentDate);
    expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.repaymentPlan.paymentAmount);
  });
  it('should translate payment date to ccd', () => {
    //Given
    const claim = new Claim();
    claim.paymentDate = new Date();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim);
    //Then
    expect(ccdResponse.repaymentDate).toBe(claim.paymentDate);
  });
});
