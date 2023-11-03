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
import {Mediation} from 'common/models/mediation/mediation';

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

  it.each([
    [PaymentOptionType.IMMEDIATELY],
    [PaymentOptionType.BY_SET_DATE],
    [PaymentOptionType.INSTALMENTS],
  ])('Claimant rejected defendant`s response as part admit when PaymentOptionType is \'%s\' with no mediation', (paymentOptionType: PaymentOptionType) => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1ClaimMediationSpecRequiredLip = {hasAgreedFreeMediation: 'No'}; //new ClaimantMediationLip('No');
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

  it('Claimant rejected defendant`s response as part admit paid already with no mediation', () => {

    // Given
    claim.applicant1AcceptAdmitAmountPaidSpec = 'No';
    claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
    claim.applicant1ClaimMediationSpecRequiredLip = {hasAgreedFreeMediation: 'No'};
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
    claim.applicant1ClaimMediationSpecRequiredLip = { hasAgreedFreeMediation: 'No' };
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
    claim.applicant1ClaimMediationSpecRequiredLip = { hasAgreedFreeMediation: 'No' };
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
    claim.applicant1ClaimMediationSpecRequiredLip = { hasAgreedFreeMediation: 'Yes' };
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
    claim.applicant1ClaimMediationSpecRequiredLip = {hasAgreedFreeMediation: 'Yes'};
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
    claim.applicant1ClaimMediationSpecRequiredLip = {hasAgreedFreeMediation: 'Yes'};
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
    claim.applicant1ClaimMediationSpecRequiredLip = { hasAgreedFreeMediation: 'Yes' };
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
    claim.applicant1ClaimMediationSpecRequiredLip = { hasAgreedFreeMediation: 'Yes' };
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
    expect(claimantResponseConfirmationContent[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(claimantResponseConfirmationContent[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
    expect(claimantResponseConfirmationContent[4]).toBeUndefined();
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
  return claim;
}

