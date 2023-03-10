import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from 'common/models/claim';
import {translateDraftResponseToCCD} from 'services/translation/response/ccdTranslation';
import {CCDPaymentOption} from 'common/models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from 'common/models/ccdResponse/ccdRepaymentPlan';
import {Party} from 'common/models/party';
import {ResponseType} from 'common/form/models/responseType';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Employment} from 'models/employment';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {DefendantEvidence} from 'models/evidence/evidence';

describe('translate response to ccd version', () => {
  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
  });

  it('should translate payment option to ccd', () => {
    //Given
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

  describe('should translate repayment plan to ccd', () => {
    it('when repayment frequency is set to once one month', () => {
      //Given
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

    it('frequency once four weeks', () => {
      //Given
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 100,
        firstRepaymentDate: new Date(),
        repaymentFrequency: 'FOUR_WEEKS',
      };
      //When
      const ccdResponse = translateDraftResponseToCCD(claim, false);
      //Then
      expect(ccdResponse.respondent1RepaymentPlan).not.toBeUndefined();
      expect(ccdResponse.respondent1RepaymentPlan?.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS);
      expect(ccdResponse.respondent1RepaymentPlan?.firstRepaymentDate).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate);
      expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount);
    });

    it('frequency once two week', () => {
      //Given
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 100,
        firstRepaymentDate: new Date(),
        repaymentFrequency: 'TWO_WEEKS',
      };
      //When
      const ccdResponse = translateDraftResponseToCCD(claim, false);
      //Then
      expect(ccdResponse.respondent1RepaymentPlan).not.toBeUndefined();
      expect(ccdResponse.respondent1RepaymentPlan?.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS);
      expect(ccdResponse.respondent1RepaymentPlan?.firstRepaymentDate).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate);
      expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount);
    });
  });

  it('should translate response type to CCD', () => {
    //Given
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

  it('should translate address has not changed to ccd', ()=>{
    //Given
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

  describe('should translate spec defence admitted required', ()=>{
    it('should be yes', () => {
      //Given
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.explanation = undefined;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {};
      claim.partialAdmission.alreadyPaid.messageName = 'Some message';
      claim.partialAdmission.alreadyPaid.option = 'yes';
      //When
      const ccdResponse = translateDraftResponseToCCD(claim, false);
      //Then
      expect(ccdResponse.specDefenceAdmittedRequired).toBe(YesNoUpperCamelCase.YES);
    });

    it('should be no', () => {
      // Given
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.explanation = undefined;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {};
      claim.partialAdmission.alreadyPaid.messageName = 'Some message';
      claim.partialAdmission.alreadyPaid.option = 'no';
      //When
      const ccdResponse = translateDraftResponseToCCD(claim, false);
      //Then
      expect(ccdResponse.specDefenceAdmittedRequired).toBe(YesNoUpperCamelCase.NO);
    });
  });

  it('should translate to respond to admitted claim amount', ()=>{
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = undefined;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = <HowMuchDoYouOwe>{};
    claim.partialAdmission.howMuchDoYouOwe.amount = 10000;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondToAdmittedClaimOwingAmount).toBe('10000');
  });

  it('should translate timeline of events', ()=>{
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = undefined;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.timeline = <DefendantTimeline>{
      rows: [
        {
          description: 'description',
          date: '12 Sep 2022',
        },
      ],

    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.specResponseTimelineOfEvents).not.toBeUndefined();
    expect(ccdResponse.specResponseTimelineOfEvents.length).toBeGreaterThan(0);
    expect(ccdResponse.specResponseTimelineOfEvents[0].value.timelineDescription).toEqual('description');
    expect(ccdResponse.specResponseTimelineOfEvents[0].value.timelineDate).toEqual('2022-09-12');
  });

  it('should translate details of why does you dispute the claim', ()=>{
    //Given
    const reason = 'here is the reason';
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = undefined;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.whyDoYouDisagree = <WhyDoYouDisagree>{
      text: reason,
    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.detailsOfWhyDoesYouDisputeTheClaim).toEqual(reason);
  });

  it('should translate to respondResponseLip', ()=>{
    //Given
    claim.evidence = <DefendantEvidence>{};
    claim.evidence.comment = 'evidence comment';
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.timeline = new DefendantTimeline();
    claim.partialAdmission.timeline.comment = 'timeline comment';
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1LiPResponse.evidenceComment).toEqual(claim.evidence.comment);
    expect(ccdResponse.respondent1LiPResponse.timelineComment).toEqual(claim.partialAdmission.timeline.comment);
  });
});
