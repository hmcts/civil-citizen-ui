import {Claim} from 'common/models/claim';
import {ResponseType} from 'common/form/models/responseType';
import {Party} from 'common/models/party';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {PartyDetails} from 'common/form/models/partyDetails';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {CaseState} from 'common/form/models/claimDetails';
import {getClaimantResponseConfirmationContent} from 'services/features/claimantResponse/claimantResponseConfirmation/claimantResponseConfirmationContentService';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'common/form/models/yesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {Mediation} from 'common/models/mediation/mediation';
import {PartyType} from 'common/models/partyType';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {HowMuchHaveYouPaid, HowMuchHaveYouPaidParams } from 'common/form/models/admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Defence} from 'common/form/models/defence';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import { CourtProposedDate, CourtProposedDateOptions } from 'common/form/models/claimantResponse/courtProposedDate';
import { CourtProposedPlan, CourtProposedPlanOptions } from 'common/form/models/claimantResponse/courtProposedPlan';
import { RepaymentDecisionType } from 'common/models/claimantResponse/RepaymentDecisionType';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Claimant Response Confirmation service', () => {
  const lang = 'en';
  let claim: Claim;
  beforeEach(() => {
    claim = getClaim();
  });

  it('Dispute Scenario when claimant intention is not to proceed with claim', () => {
    // Given
    claim.claimantResponse.intentionToProceed = {option: 'no'};
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.rejectAllOfClaim = new RejectAllOfClaim(
      RejectAllOfClaimType.DISPUTE,
    );
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.CLAIM_ENDED');
    expect(claimantResponseConfirmationContent[3]).toBeUndefined();
  });

  it('Claimant accepted defendant`s response as part admit pay immediately', () => {
    // Given
    claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = {
      paymentIntention: {paymentOption: PaymentOptionType.IMMEDIATELY},
    };
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.DEFENDANT_TO_PAY_YOU_IMMEDIATELY');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.PAYMENT_BY');
    expect(claimantResponseConfirmationContent[4].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.TELL_US_SETTLEMENT');
    expect(claimantResponseConfirmationContent[5]).toBeUndefined();
  });

  it('Claimant accepted defendant`s response as part admit pay immediately', () => {
    // Given
    claim.claimantResponse.signSettlementAgreement.signed = 'true';
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.WE_EMAILED');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.THEY_MUST_RESPOND_BEFORE');
    expect(claimantResponseConfirmationContent[4].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_THEY_SIGN');
    expect(claimantResponseConfirmationContent[5].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_DONT_SIGN');
    expect(claimantResponseConfirmationContent[6].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_CANT_AFFORD');
    expect(claimantResponseConfirmationContent[7].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_NOT_PAID');
    expect(claimantResponseConfirmationContent[8].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_SIGNS');
    expect(claimantResponseConfirmationContent[9].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.AFTER_REQUESTED');
    expect(claimantResponseConfirmationContent[10]).toBeUndefined();
  });
  it.each([
    [PaymentOptionType.IMMEDIATELY],
    [PaymentOptionType.BY_SET_DATE],
    [PaymentOptionType.INSTALMENTS],
  ])('Claimant rejected defendant`s response as part admit when PaymentOptionType is \'%s\' with no mediation', (paymentOptionType: PaymentOptionType) => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      mediationDisagreement: {
        option: YesNo.NO,
      },
    };
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = {
      paymentIntention: {paymentOption: paymentOptionType},
      alreadyPaid: {option: 'no'},
    };

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.NO_MEDIATION.WHAT_HAPPENS_NEXT_TEXT');
    expect(claimantResponseConfirmationContent[3]).toBeUndefined();
  });

  it('Claimant Intent reject the defendant plan + Defendant = ORG or LTD Company', () => {

    // Given
    claim.respondent1.type = PartyType.COMPANY;
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = {option: YesNo.NO};

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    
    // Then
    expect(claimantResponseConfirmationContent[1].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.TITLE');
    expect(claimantResponseConfirmationContent[6].data?.text).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.USE_THIS_ADDRESS.TITLE');
    expect(claimantResponseConfirmationContent[10].data?.text).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CAN_AFFORD.TITLE');
    expect(claimantResponseConfirmationContent[12].data?.text).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CANT_AFFORD.TITLE');
    expect(claimantResponseConfirmationContent[14]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as part admit paid already with no mediation', () => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      mediationDisagreement: {
        option: YesNo.NO,
      },
    };
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = {
      alreadyPaid: {option: 'yes'},
    };

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.NO_MEDIATION.WHAT_HAPPENS_NEXT_TEXT');
    expect(claimantResponseConfirmationContent[3]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as full defence full dispute and want to proceed with no mediation', () => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      mediationDisagreement: {
        option: YesNo.NO,
      },
    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse.intentionToProceed = {option: YesNo.YES};
    claim.ccdState = CaseState.JUDICIAL_REFERRAL;

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.NO_MEDIATION.WHAT_HAPPENS_NEXT_TEXT');
    expect(claimantResponseConfirmationContent[3]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as full defence states paid and says not settle with no mediation', () => {

    // Given
    claim.claimantResponse.mediation = <Mediation>{
      mediationDisagreement: {
        option: YesNo.NO,
      },
    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse.hasDefendantPaidYou = {option: YesNo.NO};
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.NO_MEDIATION.WHAT_HAPPENS_NEXT_TEXT');
    expect(claimantResponseConfirmationContent[3]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as part admit paid already with yes mediation', () => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      canWeUse: {
        option: YesNo.YES,
      },
    };
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.mediation = new Mediation(undefined, {option: YesNo.YES}, undefined, undefined);
    claim.partialAdmission = {
      alreadyPaid: {option: 'yes'},
    };

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
    expect(claimantResponseConfirmationContent[4]).toBeUndefined();
  });

  it.each([
    [PaymentOptionType.IMMEDIATELY],
    [PaymentOptionType.BY_SET_DATE],
    [PaymentOptionType.INSTALMENTS],
  ])('Claimant rejected defendant`s response as part admit when PaymentOptionType is \'%s\' with yes mediation', (paymentOptionType: PaymentOptionType) => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      canWeUse: {
        option: YesNo.YES,
      },
    };
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = {
      paymentIntention: {paymentOption: paymentOptionType},
      alreadyPaid: {option: 'no'},
    };

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
    expect(claimantResponseConfirmationContent[4]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as part admit paid already with yes mediation', () => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      canWeUse: {
        option: YesNo.YES,
      },
    };
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = {
      alreadyPaid: {option: 'yes'},
    };

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
    expect(claimantResponseConfirmationContent[4]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as full defence full dispute and want to proceed with yes mediation', () => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
    claim.claimantResponse.mediation = <Mediation>{
      canWeUse: {
        option: YesNo.YES,
      },
    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse.intentionToProceed = {option: YesNo.YES};
    claim.ccdState = CaseState.JUDICIAL_REFERRAL;

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
    expect(claimantResponseConfirmationContent[4]).toBeUndefined();
  });

  it('Claimant rejected defendant`s response as full defence states paid and says not settle with yes mediation', () => {

    // Given
    claim.claimantResponse.mediation = <Mediation>{
      canWeUse: {
        option: YesNo.YES,
      },
    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse.hasDefendantPaidYou = {option: YesNo.YES};
    const howMuchHaveYouPaidParams: HowMuchHaveYouPaidParams = {
      amount: 120,
      totalClaimAmount: 1000,
      year: '2022',
      month: '2',
      day: '14',
      text: 'Some text here...',
    };
    claim.rejectAllOfClaim = new RejectAllOfClaim(
      RejectAllOfClaimType.ALREADY_PAID,
      new HowMuchHaveYouPaid(howMuchHaveYouPaidParams),
      new WhyDoYouDisagree(''),
      new Defence(),
    );
   
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);

    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MESSAGE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
    expect(claimantResponseConfirmationContent[4]).toBeUndefined();
  });

  it('Claimant accepted defendant`s repayment plan and ask for CCJ', () => {
    // Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
    expect(claimantResponseConfirmationContent[5]).toBeUndefined();
  });

  it('Claimant rejected defendant`s repayment plan and proposed repayment plan by set date, accepts the court decision and ask for CCJ', () => {
    // Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.courtProposedDate = new CourtProposedDate(CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE);
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG3');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
    expect(claimantResponseConfirmationContent[5]).toBeUndefined();
  });
  it('Claimant rejected defendant`s repayment plan and proposed repayment plan by installments, accepts the court decision and ask for CCJ', () => {
    // Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.courtProposedPlan = new CourtProposedPlan(CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN);
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG3');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
    expect(claimantResponseConfirmationContent[5]).toBeUndefined();
  });
  it('Claimant rejected defendant`s repayment plan and proposed repayment plan by installments, court accepts claimant decision and ask for CCJ', () => {
    // Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);

    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG3');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
    expect(claimantResponseConfirmationContent[5]).toBeUndefined();
  });

  it('Claimant rejected defendant`s repayment plan and proposed repayment plan by set date, reject the court decision and request judge to decide repayment plan', () => {
    // Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.courtProposedDate = new CourtProposedDate(CourtProposedDateOptions.JUDGE_REPAYMENT_DATE);
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG4');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
    expect(claimantResponseConfirmationContent[4].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG5');
    expect(claimantResponseConfirmationContent[5].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG6');
    expect(claimantResponseConfirmationContent[6]).toBeUndefined();
  });

  it('Claimant rejected defendant`s repayment plan and proposed repayment plan by installment, reject the court decision and request judge to decide repayment plan', () => {
    // Given
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
    claim.claimantResponse.courtProposedPlan = new CourtProposedPlan(CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN);
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG4');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
    expect(claimantResponseConfirmationContent[4].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG5');
    expect(claimantResponseConfirmationContent[5].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG6');
    expect(claimantResponseConfirmationContent[6]).toBeUndefined();
  });
  it('Claimant accepted defendant`s response to settle the claim', () => {
    // Given
    claim.applicant1PartAdmitIntentionToSettleClaimSpec = 'Yes';
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    // When
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, lang);
    // Then
    expect(claimantResponseConfirmationContent[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain('000MC009');
    expect(claimantResponseConfirmationContent[0].data?.html).toContain(formatDateToFullDate(new Date()));
    expect(claimantResponseConfirmationContent[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.ACCEPTED_DEFENDANT_RESPONSE_TO_SETTLE.CLAIM_SETTLE');
  });
});

function getClaim (){
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.legacyCaseReference = '000MC009';
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
  claim.respondent1ResponseDeadline = new Date();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement();
  claim.claimantResponse.submittedDate = new Date();
  return claim;
}

