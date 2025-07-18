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
import {toCCDUnavailableDates} from 'services/translation/response/convertToCCDSmallClaimHearing';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CcdStatementOfTruth} from 'models/ccdResponse/ccdStatementOfTruth';

function getPartialAdmission(claim: Claim, option: YesNo) {
  claim.statementOfMeans = new StatementOfMeans();
  claim.statementOfMeans.explanation = undefined;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.alreadyPaid = {};
  claim.partialAdmission.alreadyPaid.messageName = 'Some message';
  claim.partialAdmission.alreadyPaid.option = option;
}

const createFullAdmitClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  return claim;
};

const createPartAdmitClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  return claim;
};

describe('translate response to ccd version', () => {
  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
  });

  it('should translate payment option for full admit claim to ccd', () => {
    //Given
    const claim: Claim = createFullAdmitClaim();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.defenceAdmitPartPaymentTimeRouteRequired).toBe(CCDPaymentOption.BY_SET_DATE);
  });

  it('should translate payment option to ccd for part admit', () => {
    //Given
    const claim = createPartAdmitClaim();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.defenceAdmitPartPaymentTimeRouteRequired).toBe(CCDPaymentOption.BY_SET_DATE);
  });

  it('should translate repayment plan for full admission to ccd', () => {
    //Given
    const claim = createFullAdmitClaim();
    claim.fullAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 100,
      firstRepaymentDate: new Date(),
      repaymentFrequency: 'MONTH',
    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1RepaymentPlan).not.toBeUndefined();
    expect(ccdResponse.respondent1RepaymentPlan?.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
    expect(ccdResponse.respondent1RepaymentPlan?.firstRepaymentDate).toBe(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate);
    expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.fullAdmission.paymentIntention.repaymentPlan.paymentAmount*100);
  });

  it('should translate repayment plan for part admission to ccd', () => {
    //Given
    const claim = createPartAdmitClaim();
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
    expect(ccdResponse.respondent1RepaymentPlan?.paymentAmount).toBe(claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount*100);
  });

  it('should translate response type to CCD', () => {
    //Given
    const claim = createFullAdmitClaim();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondent1ClaimResponseTypeForSpec).toBe(ResponseType.FULL_ADMISSION);
  });

  it('should translate payment date to CCD for full admission', () => {
    //Given
    const claim = createFullAdmitClaim();
    claim.fullAdmission.paymentIntention.paymentDate = new Date();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid).toBe(claim.fullAdmission.paymentIntention.paymentDate);
  });

  it('should translate payment date to CCD for partial admission', () => {
    //Given
    const claim = createPartAdmitClaim();
    claim.partialAdmission.paymentIntention.paymentDate = new Date();
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid).toBe(claim.partialAdmission.paymentIntention.paymentDate);
  });

  it('should translate mediation option to CCD', () => {
    //Given
    const claim = createFullAdmitClaim();
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

  it('should translate mediation option to CCD with carm fields with hasTelephoneMeditationAccessed true and hasAvailabilityMediationFinished true and all option as yes', () => {
    //Given
    const claim = createFullAdmitClaim();
    claim.mediationCarm = {
      isMediationContactNameCorrect: {
        option: YesNo.YES,
      },
      isMediationEmailCorrect: {
        option: YesNo.YES,
      },
      isMediationPhoneCorrect: {
        option: YesNo.YES,
      },
      hasUnavailabilityNextThreeMonths: {
        option: YesNo.NO,
      },
      hasTelephoneMeditationAccessed: true,
      hasAvailabilityMediationFinished: true,
    };

    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(claim.mediationCarm.isMediationContactNameCorrect.option.toUpperCase()).toBe(ccdResponse.respondent1LiPResponseCarm.isMediationContactNameCorrect.toUpperCase());
    expect(claim.mediationCarm.isMediationPhoneCorrect.option.toUpperCase()).toBe(ccdResponse.respondent1LiPResponseCarm.isMediationPhoneCorrect.toUpperCase());
    expect(claim.mediationCarm.isMediationEmailCorrect.option.toUpperCase()).toBe(ccdResponse.respondent1LiPResponseCarm.isMediationEmailCorrect.toUpperCase());
    expect(ccdResponse.respondent1LiPResponseCarm.alternativeMediationContactPerson).toBe(undefined);
    expect(ccdResponse.respondent1LiPResponseCarm.alternativeMediationTelephone).toBe(undefined);
    expect(ccdResponse.respondent1LiPResponseCarm.alternativeMediationEmail).toBe(undefined);
    expect(ccdResponse.respondent1LiPResponseCarm.unavailableDatesForMediation).toBe(undefined);

  });

  it('should translate mediation option to CCD with carm fields with hasTelephoneMeditationAccessed true and hasAvailabilityMediationFinished true and all option as no', () => {
    //Given
    const claim = createFullAdmitClaim();
    claim.mediationCarm = {
      isMediationContactNameCorrect: {
        option: YesNo.NO,
      },
      alternativeMediationContactPerson: {
        alternativeContactPerson: 'test',
      },
      isMediationEmailCorrect: {
        option: YesNo.NO,
      },
      alternativeMediationEmail: {
        alternativeEmailAddress: 'test@test.com',
      },
      isMediationPhoneCorrect: {
        option: YesNo.NO,
      },
      alternativeMediationTelephone: {
        alternativeTelephone: '123',
      },
      hasUnavailabilityNextThreeMonths: {
        option: YesNo.YES,
      },
      unavailableDatesForMediation: {
        items: [
          {
            date: new Date('2024-01-01T00:00:00.000Z'),
            from: new Date('2024-01-01T00:00:00.000Z'),
            until: new Date('2024-01-02T00:00:00.000Z'),
            unavailableDateType: UnavailableDateType.SINGLE_DATE,
          },
        ],
      },
      hasTelephoneMeditationAccessed: true,
      hasAvailabilityMediationFinished: true,
    };
    const dateExpected = toCCDUnavailableDates(claim.mediationCarm.unavailableDatesForMediation.items);
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(claim.mediationCarm.isMediationContactNameCorrect.option.toUpperCase()).toBe(ccdResponse.respondent1LiPResponseCarm.isMediationContactNameCorrect.toUpperCase());
    expect(claim.mediationCarm.isMediationPhoneCorrect.option.toUpperCase()).toBe(ccdResponse.respondent1LiPResponseCarm.isMediationPhoneCorrect.toUpperCase());
    expect(claim.mediationCarm.isMediationEmailCorrect.option.toUpperCase()).toBe(ccdResponse.respondent1LiPResponseCarm.isMediationEmailCorrect.toUpperCase());
    expect(claim.mediationCarm.alternativeMediationContactPerson.alternativeContactPerson).toBe(ccdResponse.respondent1LiPResponseCarm.alternativeMediationContactPerson);
    expect(claim.mediationCarm.alternativeMediationTelephone.alternativeTelephone).toBe(ccdResponse.respondent1LiPResponseCarm.alternativeMediationTelephone);
    expect(claim.mediationCarm.alternativeMediationEmail.alternativeEmailAddress).toBe(ccdResponse.respondent1LiPResponseCarm.alternativeMediationEmail);
    expect(dateExpected[0].value.toDate).toBe(ccdResponse.respondent1LiPResponseCarm.unavailableDatesForMediation[0].value.toDate);
    expect(dateExpected[0].value.fromDate).toBe(ccdResponse.respondent1LiPResponseCarm.unavailableDatesForMediation[0].value.fromDate);
    expect(dateExpected[0].value.unavailableDateType).toBe(ccdResponse.respondent1LiPResponseCarm.unavailableDatesForMediation[0].value.unavailableDateType);
    expect('defendant').toBe(ccdResponse.respondent1LiPResponseCarm.unavailableDatesForMediation[0].value.who);

  });

  it('should translate address changed to ccd', ()=> {
    //Given
    const claim = createFullAdmitClaim();
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

  it('should translate address has not changed to ccd', ()=>{
    //Given
    const claim = createFullAdmitClaim();
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
      getPartialAdmission(claim, YesNo.YES);
      //When
      const ccdResponse = translateDraftResponseToCCD(claim, false);
      //Then
      expect(ccdResponse.specDefenceAdmittedRequired).toBe(YesNoUpperCamelCase.YES);
    });

    it('should be no', () => {
      // Given
      getPartialAdmission(claim, YesNo.NO);
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
    expect(ccdResponse.respondToAdmittedClaimOwingAmount).toBe('1000000');
    expect(ccdResponse.respondToAdmittedClaimOwingAmountPounds).toBe('10000');
  });

  it.each([[100, 10000], [1, 100], [123, 12300], [293.78, 29378], [139.98, 13998], [257.29, 25729], [8330.38, 833038], [312.90, 31290]])('should translate to respond to admitted claim amount with floating point error', (amountInPounds, expectedAmount)=>{
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = undefined;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = <HowMuchDoYouOwe>{};
    claim.partialAdmission.howMuchDoYouOwe.amount = amountInPounds;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.respondToAdmittedClaimOwingAmount).toBe(expectedAmount.toString());
    expect(ccdResponse.respondToAdmittedClaimOwingAmountPounds).toBe(amountInPounds.toString());
  });

  it('should translate timeline of events', ()=>{
    //Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.explanation = undefined;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.timeline = <DefendantTimeline>{
      rows: [
        {
          description: 'description',
          date: new Date('2022-09-12'),
        },
      ],

    };
    //When
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //Then
    expect(ccdResponse.specResponseTimelineOfEvents).not.toBeUndefined();
    expect(ccdResponse.specResponseTimelineOfEvents.length).toBeGreaterThan(0);
    expect(ccdResponse.specResponseTimelineOfEvents[0].value.timelineDescription).toEqual('description');
    expect(ccdResponse.specResponseTimelineOfEvents[0].value.timelineDate).toEqual(new Date('2022-09-12'));
  });

  it('should translate details of why does you dispute the claim', ()=>{
    //Given
    const reason = 'here is the reason';
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
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
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
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

  it('should translate to respondent1LiPStatementOfTruth - when statement of truth misses name & role', () => {
    //given
    claim.defendantStatementOfTruth = {isFullAmountRejected: false, type: undefined};
    const expected = {name: undefined, role: undefined} as CcdStatementOfTruth;
    //when
    const ccdResponse = translateDraftResponseToCCD(claim, false);
    //then
    expect(ccdResponse.respondent1LiPStatementOfTruth).toEqual(expected);
  });

  it('should translate to respondent1LiPStatementOfTruth - when statement of truth contains name and role', () => {
    //given
    claim.defendantStatementOfTruth = {isFullAmountRejected: false, type: undefined, signerName: 'Test', signerRole: 'Defendant'};
    const expected = {name: 'Test', role: 'Defendant'} as CcdStatementOfTruth;
    //when
    const ccdClaim = translateDraftResponseToCCD(claim, false);
    //then
    expect(ccdClaim.respondent1LiPStatementOfTruth).toEqual(expected);
  });
});
