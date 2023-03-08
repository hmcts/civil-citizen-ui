import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from 'common/models/claim';
import {translateDraftResponseToCCD} from 'services/translation/response/ccdTranslation';
import {CCDPaymentOption} from 'common/models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from 'common/models/ccdResponse/ccdRepaymentPlan';
import {Party} from 'common/models/party';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Employment} from 'models/employment';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';

describe('translate response to ccd version', () => {
  it('should translate payment option to ccd', () => {
    //Given
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.defenceAdmitPartPaymentTimeRouteRequired).toBe(CCDPaymentOption.BY_SET_DATE);
  });
  it('should translate repayment plan to ccd', () => {
    //Given
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 100,
      firstRepaymentDate: new Date(),
      repaymentFrequency: 'MONTH',
    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1RepaymentPlan).not.toBeUndefined();
    expect(ccdResponse.respondent1RepaymentPlan?.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
    expect(ccdResponse.respondent1RepaymentPlan?.firstRepaymentDate).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate);
    expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount);
  });

  it('should translate response type to CCD', () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.fullAdmission = new FullAdmission();
    claim.partialAdmission = new PartialAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1ClaimResponseTypeForSpec).toBe(ResponseType.FULL_ADMISSION);
  });
  it('should translate payment date to CCD', () => {
    //Given
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentDate = new Date();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid).toBe(claim.partialAdmission.paymentIntention.paymentDate);
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
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
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
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
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
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.specAoSApplicantCorrespondenceAddressRequired).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate bank list has not changed to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.bankAccounts = undefined;
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.respondent1BankAccountList).toBe(undefined);
  });

  it('should translate disability changed to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.disability = new GenericYesNo(YesNo.YES);
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.disabilityPremiumPayments).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate severe disability changed to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.severeDisability = new GenericYesNo(YesNo.YES);
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.severeDisabilityPremiumPayments).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate employment changed to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    const employment : Employment = {
      declared: true,
      employmentType: undefined,
    };
    claim.statementOfMeans.employment = employment;
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.defenceAdmitPartEmploymentTypeRequired).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate court order changed to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    const courtOrders = new CourtOrders(true, undefined);
    claim.statementOfMeans.courtOrders = courtOrders;
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.respondent1CourtOrderPaymentOption).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate debt undefined to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.debts = undefined;
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.respondent1LoanCreditDetails).toBe(undefined);
  });

  it('should translate why not pay to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = {
      text: 'test',
    };
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.responseToClaimAdmitPartWhyNotPayLRspec).toBe('test');
  });

  it('should translate undefined text why not pay to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = {
      text: undefined,
    };
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.responseToClaimAdmitPartWhyNotPayLRspec).toBe(undefined);
  });

  it('should translate undefined why not pay to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = undefined;
    const addressChanged = false;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, addressChanged);
    //Then
    expect(ccdResponse.responseToClaimAdmitPartWhyNotPayLRspec).toBe(undefined);
  });
});
