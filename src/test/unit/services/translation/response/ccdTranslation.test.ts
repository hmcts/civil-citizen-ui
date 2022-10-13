import {PaymentOptionType} from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from '../../../../../main/common/models/claim';
import {translateDraftResponseToCCD} from '../../../../../main/services/translation/response/ccdTranslation';
import {CCDPaymentOption} from '../../../../../main/common/models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from '../../../../../main/common/models/ccdResponse/ccdRepaymentPlan';
import {Party} from '../../../../../main/common/models/party';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {YesNoUpperCamelCase} from '../../../../../main/common/form/models/yesNo';

describe('translate response to ccd version', () => {
  it('should translate payment option to ccd', () => {
    //Given
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.BY_SET_DATE;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.defenceAdmitPartPaymentTimeRouteRequired).toBe(CCDPaymentOption.BY_SET_DATE);
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
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1RepaymentPlan).not.toBeUndefined();
    expect(ccdResponse.respondent1RepaymentPlan?.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
    expect(ccdResponse.respondent1RepaymentPlan?.firstRepaymentDate).toBe(claim.repaymentPlan.firstRepaymentDate);
    expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.repaymentPlan.paymentAmount);
  });
  it('should translate response type to CCD', () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1ClaimResponseTypeForSpec).toBe(ResponseType.FULL_ADMISSION);
  });
  it('should translate payment date to CCD', () => {
    //Given
    const claim = new Claim();
    claim.paymentDate = new Date();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid).toBe(claim.paymentDate);
  });
  it('should translate mediation option to CCD', () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.mediation = {
      canWeUse: undefined,
      mediationDisagreement: undefined,
      companyTelephoneNumber: {
        mediationContactPerson: 'test',
        mediationPhoneNumber: '123',
      },
    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.responseClaimMediationSpecRequired).toBe(YesNoUpperCamelCase.YES);
  });
  it('should translate address changed to ccd', ()=> {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.mediation = {
      canWeUse: undefined,
      mediationDisagreement: undefined,
      companyTelephoneNumber: {
        mediationContactPerson : 'test',
        mediationPhoneNumber : '123',
      },
    };
    const addressChanged = true;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.specAoSApplicantCorrespondenceAddressRequired).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate addres has not changed to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.mediation = {
      canWeUse: undefined,
      mediationDisagreement: undefined,
      companyTelephoneNumber: {
        mediationContactPerson : 'test',
        mediationPhoneNumber : '123',
      },
    };
    const addressChanged = false;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.specAoSApplicantCorrespondenceAddressRequired).toBe(YesNoUpperCamelCase.YES);
  });

});
