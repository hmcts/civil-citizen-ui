import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {YesNo, YesNoNotReceived} from 'common/form/models/yesNo';
import {
  buildClaimantHearingRequirementsSection, buildClaimantResponseMediationSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder';
import {CaseState} from 'common/form/models/claimDetails';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
import {
  VulnerabilityQuestions,
} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {
  WelshLanguageRequirements,
} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {mockExpertDetailsList} from '../directionsQuestionnaire/experts/expertDetailsService.test';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
  CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  DETERMINATION_WITHOUT_HEARING_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {ResponseType} from 'common/form/models/responseType';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {Party} from 'common/models/party';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ChooseHowToProceed} from 'common/form/models/claimantResponse/chooseHowToProceed';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'common/models/claimantResponse/ccj/paidAmount';
import {Mediation} from 'common/models/mediation/mediation';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {CourtProposedPlan, CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {PartialAdmission} from 'models/partialAdmission';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Full Defence', () => {
  const claimId = '5129';
  const lang = 'en';
  it('should display decide whether to proceed task with proceed value as no as complete with hearing requirements as incomplete and free telephone mediation as incomplete for full defense states paid minti not applicable', () => {
    //Given
    const claim=new Claim();
    claim.mediation=new Mediation();
    claim.mediation.companyTelephoneNumber=new CompanyTelephoneNumber();
    claim.mediation.companyTelephoneNumber.mediationPhoneNumber='1';
    claim.mediation.canWeUse={
      mediationPhoneNumber:'12',
    };
    claim.respondent1=new Party();
    claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
    claim.claimantResponse=new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou=new GenericYesNo();
    claim.claimantResponse.hasDefendantPaidYou.option=YesNo.NO;
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled=new GenericYesNo();
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled.option=YesNo.NO;
    claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.YES;
    claim.claimantResponse.hasPartAdmittedBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartAdmittedBeenAccepted.option=YesNo.NO;
    claim.totalClaimAmount=9000;
    claim.rejectAllOfClaim=new RejectAllOfClaim();
    claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
    claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
    claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;

    //When
    const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
    const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
    //Then
    expect(whatToDoNext.tasks.length).toBe(2);
    expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE');
    expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    expect(whatToDoNext.tasks[1].description).toEqual(
      'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
    expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    expect(hearingRequirement.tasks.length).toBe(1);
    expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
    expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
  });
  it('should display decide wether to proceed task with proceed value as no as complete and mediation part is built for full defense states paid', () => {
    //Given
    const claim=new Claim();
    claim.mediation=new Mediation();
    claim.mediation.companyTelephoneNumber=new CompanyTelephoneNumber();
    claim.mediation.companyTelephoneNumber.mediationPhoneNumber='1';
    claim.mediation.canWeUse={
      mediationPhoneNumber:'12',
    };
    claim.respondent1=new Party();
    claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
    claim.claimantResponse=new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou=new GenericYesNo();
    claim.claimantResponse.hasDefendantPaidYou.option=YesNo.YES;
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled=new GenericYesNo();
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled.option=YesNo.NO;
    claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.YES;
    claim.claimantResponse.hasPartAdmittedBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartAdmittedBeenAccepted.option=YesNo.NO;
    claim.totalClaimAmount=9000;
    claim.rejectAllOfClaim=new RejectAllOfClaim();
    claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
    claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
    claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;
    //When
    const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
    //Then
    expect(whatToDoNext.tasks.length).toBe(2);
    expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE');
    expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    expect(whatToDoNext.tasks[1].description).toEqual(
      'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
    expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
  });
  it('should display decide wether to proceed task with proceed value as yes as complete for full defense states paid', () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
    claim.rejectAllOfClaim = {
      option: RejectAllOfClaimType.ALREADY_PAID, howMuchHaveYouPaid: {
        amount: 9000,
      } as HowMuchHaveYouPaid,
    };
    claim.totalClaimAmount = 9000;
    claim.claimantResponse = {
      hasFullDefenceStatesPaidClaimSettled: {
        option: 'yes',
      },
      hasPartPaymentBeenAccepted: {
        option: 'yes',
      },
    } as ClaimantResponse;
    //When
    const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
    //Then
    expect(whatToDoNext.tasks.length).toBe(1);
    expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE');
    expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
  });
});

describe('Claimant Response Task List builder', () => {
  const claimId = '5129';
  const lang = 'en';
  const viewDefendantsReponseUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL);
  const giveUsDetailsClaimantHearingSmallClaimsUrl = constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL);
  const giveUsDetailsClaimantHearingFastTrackUrl = constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL);
  const checkAndSubmitUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHECK_ANSWERS_URL);
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;

  describe('How they responded section', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
    });
    it('should display view defendant`s response task as incomplete', () => {
      //When
      const howDefendantRespond = buildHowDefendantRespondSection(claim, claimId, lang);
      //Then
      expect(howDefendantRespond.tasks.length).toBe(1);
      expect(howDefendantRespond.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE');
      expect(howDefendantRespond.tasks[0].url).toEqual(viewDefendantsReponseUrl);
      expect(howDefendantRespond.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display view defendant`s response task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{defendantResponseViewed: true};
      //When
      const howDefendantRespond = buildHowDefendantRespondSection(claim, claimId, lang);
      //Then
      expect(howDefendantRespond.tasks.length).toBe(1);
      expect(howDefendantRespond.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE');
      expect(howDefendantRespond.tasks[0].url).toEqual(viewDefendantsReponseUrl);
      expect(howDefendantRespond.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });
  });

  describe('Choose what to do next section', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.respondent1 = {responseType: ResponseType.PART_ADMISSION};
      claim.claimantResponse = new ClaimantResponse();
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(true);
    });
    describe('Choose what to do next section Full Admission', () => {
      it('should display Accept or reject Repayment Plan task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Choose how to formalise task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Sign Settlement as complete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
        claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
        claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement();
        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.SIGN_SETTLEMENT');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      });
      it('should display Request a CCJ as complete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
        claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 10);
        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.REQUEST_COUNTY_COURT_JUDGMENT');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      });
      it('should display Propose Alternative Repayment Plan as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Choose how to formalise repayment task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
        claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
        claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
        claim.claimantResponse.courtProposedDate = new CourtProposedDate();
        claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE;

        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Request a County Court Judgment task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
        claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
        claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
        claim.claimantResponse.courtProposedDate = new CourtProposedDate();
        claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.JUDGE_REPAYMENT_DATE;

        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.REQUEST_COUNTY_COURT_JUDGMENT');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Choose how to formalise repayment task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
        claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
        claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
        claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
        claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN;

        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Request a County Court Judgment task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
        claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
        claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
        claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
        claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;

        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.REQUEST_COUNTY_COURT_JUDGMENT');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      });
      it('should display Choose how to formalise repayment task as incomplete', () => {
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
        claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
        claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
        claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;

        //When
        const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
        //Then
        expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
        expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
        expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
        expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
        expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      });
    });
    it('should display Accept or reject the amount task as incomplete', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Free telephone mediation task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{hasPartAdmittedBeenAccepted: {option: YesNo.NO}};
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Accept or reject their repayment plan task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{hasPartAdmittedBeenAccepted: {option: YesNo.YES}};
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Choose how to formalise repayment task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display propose alternative repayment task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.NO},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display Choose how to formalise repayment task as incomplete', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = new GenericYesNo(YesNo.YES);
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      claim.claimantResponse.courtProposedDate = new CourtProposedDate();
      claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE;

      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Request a County Court Judgment task as incomplete', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = new GenericYesNo(YesNo.YES);
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.claimantResponse.courtProposedDate = new CourtProposedDate();
      claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.JUDGE_REPAYMENT_DATE;

      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.REQUEST_COUNTY_COURT_JUDGMENT');
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Choose how to formalise repayment task as incomplete', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = new GenericYesNo(YesNo.YES);
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
      claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN;

      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Request a County Court Judgment task as incomplete', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = new GenericYesNo(YesNo.YES);
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
      claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;

      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.REQUEST_COUNTY_COURT_JUDGMENT');
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Choose how to formalise repayment task as incomplete', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = new GenericYesNo(YesNo.YES);
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;

      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display Choose how to formalise repayment task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Choose how to formalise repayment task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display Accept or Reject Admitted task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      };
      claim.partialAdmission = {
        paymentIntention: undefined,
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display Choose how to formalise repayment task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS,
          repaymentPlan: {paymentAmount: 50, repaymentFrequency: TransactionSchedule.WEEK, firstRepaymentDate: new Date(Date.now())}},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Accept or Reject Repayment task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display Accept or Reject Repayment task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display Choose how to formalise repayment task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS,
          repaymentPlan: {paymentAmount: 50, repaymentFrequency: TransactionSchedule.WEEK, firstRepaymentDate: new Date(Date.now())}},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display Sign a settlement agreement task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.NO},
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
        suggestedPaymentIntention :{
          paymentOption : PaymentOptionType.BY_SET_DATE,
        },
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[4].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.SIGN_SETTLEMENT');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[4].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display Request a County Court Judgment task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.NO},
        chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
        suggestedPaymentIntention :{
          paymentOption : PaymentOptionType.BY_SET_DATE,
        },
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display Sign a settlement agreement task as complete', () => {
      //Given

      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.NO},
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
        signSettlementAgreement: {signed: YesNo.YES},
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
        suggestedPaymentIntention :{
          paymentOption : PaymentOptionType.BY_SET_DATE,
        },
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display Request a County Court Judgment task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.NO},
        suggestedPaymentIntention :{
          paymentOption : PaymentOptionType.BY_SET_DATE,
        },
        chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
        ccjRequest: {paidAmount: {option: YesNo.YES}},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT');
      expect(whatToDoNext.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT');
      expect(whatToDoNext.tasks[3].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[3].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display decide wether to proceed task as incomplete for full defense', () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.DECIDE_WHETHER_TO_PROCEED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display decide wether to proceed task with proceed value as yes as complete with hearing requirements as incomplete and free telephone mediation as incomplete for full defense minti not applicable', () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
      claim.mediation = {
        canWeUse: {
          option: 'yes',
        },
        companyTelephoneNumber: {},
      } as Mediation;
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = {
        intentionToProceed: {
          option: 'yes',
        },
      } as ClaimantResponse;
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks.length).toBe(2);
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.DECIDE_WHETHER_TO_PROCEED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].description).toEqual(
        'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
      expect(hearingRequirement.tasks.length).toBe(1);
      expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display decide wether to proceed task with proceed value as no as complete for full defense', () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = {
        intentionToProceed: {
          option: 'no',
        },
      } as ClaimantResponse;
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks.length).toBe(1);
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.DECIDE_WHETHER_TO_PROCEED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should not display What to do next section for full defense states paid (amount was LESS THAN full amount)', () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
      claim.rejectAllOfClaim = {
        option: RejectAllOfClaimType.ALREADY_PAID, howMuchHaveYouPaid: {
          amount: 8000,
        } as HowMuchHaveYouPaid,
      };
      claim.totalClaimAmount = 9000;
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks.length).toBe(0);
      expect(whatToDoNext.tasks[0]).toBeUndefined();
    });
  });

  describe('Your response section', () => {
    const haveYoBeenPaidUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL);
    const settleClaimForPaidAmountUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL);
    const freeMediationUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
      claim.rejectAllOfClaim = {
        option: RejectAllOfClaimType.ALREADY_PAID, howMuchHaveYouPaid: {
          amount: 8000,
        } as HowMuchHaveYouPaid,
      };
      claim.totalClaimAmount = 9000;
      claim.claimantResponse = new ClaimantResponse();
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(true);
    });
    it('should display Your Response section and haveYouBeenPaidTask for full defense states paid (amount was LESS THAN full amount)', () => {
      //Given
      //When
      const yourResponse = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(yourResponse.title).toBe('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE');
      expect(yourResponse.tasks.length).toBe(1);
      expect(yourResponse.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID');
      expect(yourResponse.tasks[0].url).toEqual(haveYoBeenPaidUrl);
      expect(yourResponse.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      expect(yourResponse.tasks[1]).toBeUndefined();
    });
    it('should display haveYouBeenPaidTask and settleClaimForPaidAmountTask as second task for when claimant accepted defendant payment', () => {
      //Given
      claim.claimantResponse = {
        hasDefendantPaidYou: new GenericYesNo(YesNo.YES),
      } as ClaimantResponse;
      //When
      const yourResponse = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(yourResponse.title).toBe('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE');
      expect(yourResponse.tasks.length).toBe(2);
      expect(yourResponse.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR');
      expect(yourResponse.tasks[1].url).toEqual(settleClaimForPaidAmountUrl);
      expect(yourResponse.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
      expect(yourResponse.tasks[2]).toBeUndefined();
    });
    it('should display haveYouBeenPaidTask and freeTelephoneMediationTas as second for when claimant doesn`t accept defendant payment', () => {
      //Given
      claim.claimantResponse = {
        hasDefendantPaidYou: new GenericYesNo(YesNo.NO),
      } as ClaimantResponse;
      //When
      const yourResponse = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(yourResponse.title).toBe('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE');
      expect(yourResponse.tasks.length).toBe(2);
      expect(yourResponse.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(yourResponse.tasks[1].url).toEqual(freeMediationUrl);
      expect(yourResponse.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
      expect(yourResponse.tasks[2]).toBeUndefined();
    });
    it('should display haveYouBeenPaidTask, settleClaimForPaidAmountTask and freeTelephoneMediationTask as third task for when claimant accept defendant payment but not settle the claim', () => {
      //Given
      claim.claimantResponse = {
        hasDefendantPaidYou: new GenericYesNo(YesNo.YES),
        hasPartPaymentBeenAccepted: new GenericYesNo(YesNo.NO),
        rejectionReason: {
          text: 'test',
        },
      } as ClaimantResponse;
      //When
      const yourResponse = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(yourResponse.title).toBe('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE');
      expect(yourResponse.tasks.length).toBe(3);
      expect(yourResponse.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(yourResponse.tasks[2].url).toEqual(freeMediationUrl);
      expect(yourResponse.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      expect(yourResponse.tasks[3]).toBeUndefined();
    });
    it('should display haveYouBeenPaidTask and freeTelephoneMediationTas as second for when claimant doesn`t accept defendant payment for Lip v Lr case', () => {
      //Given
      claim.claimantResponse = {
        hasDefendantPaidYou: new GenericYesNo(YesNo.NO),
      } as ClaimantResponse;
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(false);
      claim.isDefendantLrAgreedForMediation = jest.fn().mockReturnValue(true);
      //When
      const yourResponse = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(yourResponse.title).toBe('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE');
      expect(yourResponse.tasks.length).toBe(2);
      expect(yourResponse.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(yourResponse.tasks[1].url).toEqual(freeMediationUrl);
      expect(yourResponse.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
      expect(yourResponse.tasks[2]).toBeUndefined();
    });
    it('should display haveYouBeenPaidTask, settleClaimForPaidAmountTask and freeTelephoneMediationTask as third task for when claimant accept defendant payment but not settle the claim for Lip v Lr case', () => {
      //Given
      claim.claimantResponse = {
        hasDefendantPaidYou: new GenericYesNo(YesNo.YES),
        hasPartPaymentBeenAccepted: new GenericYesNo(YesNo.NO),
        rejectionReason: {
          text: 'test',
        },
      } as ClaimantResponse;
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(false);
      claim.isDefendantLrAgreedForMediation = jest.fn().mockReturnValue(true);
      //When
      const yourResponse = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(yourResponse.title).toBe('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE');
      expect(yourResponse.tasks.length).toBe(3);
      expect(yourResponse.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[1].status).toEqual(TaskStatus.COMPLETE);
      expect(yourResponse.tasks[2].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(yourResponse.tasks[2].url).toEqual(freeMediationUrl);
      expect(yourResponse.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
      expect(yourResponse.tasks[3]).toBeUndefined();
    });
  });

  describe('Your response section', () => {
    it('should display amount have been paid task as incomplete', () => {
      //When
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.partialAdmission = {
        alreadyPaid: {option: YesNo.YES},
      };
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should not display free telephone mediation when carm applicable', () => {
      //Given
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.claimantResponse = <ClaimantResponse>{ hasDefendantPaidYou: { option: YesNo.NO } };
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(true);
      //When
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, true);
      //Then
      expect(whatToDoNext.tasks.length).toEqual(1);
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID');
      expect(whatToDoNext.tasks[0].description).not.toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display free telephone mediation task as incomplete', () => {
      //Given
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.claimantResponse = <ClaimantResponse>{ hasDefendantPaidYou: { option: YesNo.NO } };
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(true);
      //When
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display settle the claim task as incomplete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{hasDefendantPaidYou: {option: YesNo.YES}};
      //When
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });
    it('should display settle the claim task as complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{hasDefendantPaidYou: {option: YesNo.YES}, hasPartPaymentBeenAccepted: {option: YesNo.YES}};
      //When
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display settle the claim task as complete for full defense states paid', () => {
      jest.spyOn(claim, 'isFullDefence').mockReturnValueOnce(true);
      jest.spyOn(claim, 'hasPaidInFull').mockReturnValueOnce(true);
      //Given
      claim.claimantResponse = <ClaimantResponse>{ hasFullDefenceStatesPaidClaimSettled: { option: YesNo.YES } };
      //When
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });
    it('should display not settle the claim task as complete for full defense states paid', () => {
      jest.spyOn(claim, 'isFullDefence').mockReturnValueOnce(true);
      jest.spyOn(claim, 'hasPaidInFull').mockReturnValueOnce(true);
      //Given
      claim.claimantResponse = <ClaimantResponse>{ hasFullDefenceStatesPaidClaimSettled: { option: YesNo.NO } };
      //When
      const whatToDoNext = buildYourResponseSection(claim, claimId, lang, false);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR');
      expect(whatToDoNext.tasks[1].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(whatToDoNext.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });
  });

  describe('Mediation section', () => {
    it('should display mediation when carm applicable', () => {
      //Given
      claim.respondent1 = { responseType: ResponseType.FULL_DEFENCE };
      claim.claimantResponse = <ClaimantResponse>{ hasDefendantPaidYou: { option: YesNo.NO } };
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(true);
      //When
      const mediation = buildClaimantResponseMediationSection(claim, claimId, lang, true);
      //Then
      expect(mediation.tasks.length).toEqual(2);
      expect(mediation.tasks[0].description).toEqual('COMMON.TELEPHONE_MEDIATION');
      expect(mediation.tasks[1].description).toEqual('COMMON.AVAILABILITY_FOR_MEDIATION');
      expect(mediation.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      expect(mediation.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should not display mediation when carm not applicable', () => {
      //Given
      claim.respondent1 = { responseType: ResponseType.FULL_DEFENCE };
      claim.claimantResponse = <ClaimantResponse>{ hasDefendantPaidYou: { option: YesNo.NO } };
      claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(true);
      //When
      const mediation = buildClaimantResponseMediationSection(claim, claimId, lang, false);
      //Then
      expect(mediation).toEqual(undefined);
    });
  });

  describe('Your hearing requirements section', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.NO};
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.witnesses = new Witnesses();
      claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
    });
    it('shouldn`t display hearingRequirement section when there is no value for settlement minti not applicable', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{hasPartAdmittedBeenAccepted: undefined};

      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    it('shouldn`t display hearingRequirement section when claimant rejected settlement for defendent`s partial admission amount minti not applicable', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    it('shouldn`t display hearingRequirement section when claimant accepts defendant paid amount in Full Defence states Paid (when states paid amount was LESS THAN full amount) minti not applicable', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = undefined;
      claim.claimantResponse.hasDefendantPaidYou = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    it('shouldn`t display hearingRequirement section when claimant settle claim defendant paid amount in Full Defence states Paid (when states paid amount was LESS THAN full amount)  minti not applicable', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = undefined;
      claim.claimantResponse.hasDefendantPaidYou = {option: YesNo.YES};
      claim.claimantResponse.hasPartPaymentBeenAccepted = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    describe('Small Claims track DQ', () => {
      beforeEach(() => {
        claim.totalClaimAmount = 9000;
      });
      it('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount minti not applicable', () => {
        //Given
        claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.NO};
        claim.totalClaimAmount = 9000;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task task as incomplete with empty directions questionnaire minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when other witnesses is not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.witnesses = new Witnesses();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when phone or video hearing is not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when vulnerability not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when welsh language requirements not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as complete for small claims when all information provided - expert not required scenario minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.expertRequired = false;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as complete when expert required and expert report details available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.expertRequired = true;
        claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when expert required and expert report details not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertRequired = true;
        claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available but not wanted to ask for court permission to use an expert minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available but wanted to ask for court permission to use an expert minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert but there is nothing expert can still examine minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert, there is something expert can still examine but expert details not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = undefined;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
      });

    });

    describe('Fast track DQ', () => {
      beforeEach(() => {
        claim.totalClaimAmount = 24000;
      });
      it('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount minti not applicable', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task task as incomplete with empty directions questionnaire minti not applicable', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when other witnesses is not available minti not applicable', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as incomplete when phone or video hearing is not available minti not applicable', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as incomplete when vulnerability not available minti not applicable', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as incomplete when welsh language requirements not available minti not applicable', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as complete for fast track claims when all information provided - expert evidence not used sceneraio minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.experts = {
          expertEvidence: {option: YesNo.NO},
        };
        claim.claimantResponse.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.considerClaimantDocuments = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert evidence used but sent expert reports not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertEvidence = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.sentExpertReports = {};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as incomplete when expert evidence used and sharing expert with other party not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.sharedExpert = {};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as incomplete when expert evidence used used and expert details not available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = {items: []};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });

      it('should display give us details for hearing task as complete when expert evidence used, sent expert reports, sharedExpert and expert details available minti not applicable', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.considerClaimantDocuments = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.sentExpertReports = {option: YesNoNotReceived.YES};
        claim.claimantResponse.directionQuestionnaire.experts.sharedExpert = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, false);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
      });
    });

    describe('Intermediate track DQ', () => {
      beforeEach(() => {
        claim.totalClaimAmount = 26000;
      });
      it('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount', () => {
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, true);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete documents to consider not complete', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.experts = {
          expertEvidence: {option: YesNo.NO},
        };
        claim.claimantResponse.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, true);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), getCommonJourneyCompleted());
        claim.claimantResponse.directionQuestionnaire.experts = {
          expertEvidence: {option: YesNo.NO},
        };
        claim.claimantResponse.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang, true);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });
    });
  });

  describe('Submit section', () => {
    it('should display check and submit your response task as incomplete', () => {
      //When
      const submit = buildClaimantResponseSubmitSection(claimId, lang);
      //Then
      expect(submit.tasks[0].description).toEqual('TASK_LIST.SUBMIT.CHECK_AND_SUBMIT');
      expect(submit.tasks[0].url).toEqual(checkAndSubmitUrl);
      expect(submit.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });
  });
});

function getCommonJourneyCompleted() {
  return {
    defendantYourselfEvidence: {option: YesNo.NO},
    hearing: <Hearing>{
      phoneOrVideoHearing: {option: YesNo.NO},
      supportRequiredList: {option: YesNo.NO},
      specificCourtLocation: <SpecificCourtLocation>{},
      cantAttendHearingInNext12Months: {option: YesNo.NO},
    },
    witnesses: <Witnesses>{
      otherWitnesses: {option: YesNo.NO},
    },
    vulnerabilityQuestions: <VulnerabilityQuestions>{
      vulnerability: {option: YesNo.NO},
    },
    welshLanguageRequirements: <WelshLanguageRequirements>{
      language: {
        speakLanguage: LanguageOptions.WELSH,
        documentsLanguage: LanguageOptions.ENGLISH,
      },
    },
    experts: new Experts(),
  };
}
