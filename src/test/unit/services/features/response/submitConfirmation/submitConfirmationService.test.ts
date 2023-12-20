import {Claim} from 'common/models/claim';
import {
  buildNextStepsSection,
  buildSubmitStatus,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/submitConfirmationBuilder';
import {
  getNextStepsTitle,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent';
import {ResponseType} from 'common/form/models/responseType';
import {PartyType} from 'common/models/partyType';
import {Party} from 'common/models/party';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Defence} from 'common/form/models/defence';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {PartyDetails} from 'common/form/models/partyDetails';
import {FullAdmission} from 'common/models/fullAdmission';
import {YesNo} from 'common/form/models/yesNo';
import {Mediation} from 'common/models/mediation/mediation';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const SMALL_CLAIM_AMOUNT = 1000;
describe('Submit Confirmation service', () => {
  const mockClaimId = '5129';
  const lang = 'en';

  describe('Full admission pay immediately scenario', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01T00:00:00.000Z');
    claim.respondent1 = new Party();
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
    claim.applicant1.type = PartyType.COMPANY;
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
    claim.respondent1.type = PartyType.ORGANISATION;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0]?.data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle(lang);
      expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.MAKE_SURE_THAT');
      expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CAN_REQUEST_CCJ');
      expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC');
      expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CALL_COURT_FOR_YOU_PAID');
      expect(nextStepsSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.CONTACT_CLAIMANT');
      expect(nextStepsSection[1].data?.textAfter).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.href).toEqual('/dashboard/5129/contact-them');
    });
  });

  describe('Full admission pay by date scenario', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
    claim.respondent1.type = PartyType.ORGANISATION;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;

    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
    claim.applicant1.type = PartyType.COMPANY;

    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      expect(submitStatusSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle(lang);
      expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.PAY_CLAIMANT_BY_DATE');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_CCJ_AGAINST_YOU');
      expect(nextStepsSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER');
      expect(nextStepsSection[4].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });
  });

  describe('Full admission pay by installment scenario', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
    claim.respondent1.type = PartyType.ORGANISATION;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;

    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
    claim.applicant1.type = PartyType.COMPANY;

    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_INSTALLMENTS.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      expect(submitStatusSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle(lang);
      expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_CCJ_AGAINST_YOU');
      expect(nextStepsSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER');
      expect(nextStepsSection[4].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });
  });

  describe('Partial admission pay immediatly scenario', () => {
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;

    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
    claim.applicant1.type = PartyType.COMPANY;

    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
    claim.respondent1.type = PartyType.INDIVIDUAL;
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;

    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0]?.data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW');
      expect(submitStatusSection[1]?.data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle(lang);
      expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_NEED_PAY_IMMEDIATELY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.MAKE_SURE_THAT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.THEY_GET_MONEY_BY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CHEQUES_OR_BANK_TRANSFERS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.CONTACT_CLAIMANT');
      expect(nextStepsSection[2].data?.textAfter).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[2].data?.href).toContain(`/dashboard/${mockClaimId}/contact-them`);
      expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.IF_CLAIMANT_ACCEPTS_OFFER_OF');
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CLAIM_SETTLED');
      expect(nextStepsSection[5].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER');
      expect(nextStepsSection[6].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_WILL_ASK_MEDIATION');
      expect(nextStepsSection[7].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_DONT_WANT_MEDIATION');
    });
  });

  describe('Partial admission pay by instalments scenario', () => {
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
    claim.applicant1.type = PartyType.COMPANY;

    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
    claim.respondent1.type = PartyType.INDIVIDUAL;
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;

    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.YOU_BELIEVE_YOU_OWE');
      expect(submitStatusSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.WE_SENT_EXPLANATION');
      expect(submitStatusSection[2].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
    });

    it('should display financial details in status if type isBussines', () => {
      if (claim.respondent1) {
        claim.respondent1.type = PartyType.ORGANISATION;
      }
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.YOU_BELIEVE_YOU_OWE');
      expect(submitStatusSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.WE_SENT_EXPLANATION');
      expect(submitStatusSection[2].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
      expect(submitStatusSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.SEND_FINANCIAL_DETAILS');
      expect(submitStatusSection[4].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.SEND_STATEMENT_OF_ACC');
      expect(submitStatusSection[5].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.GET_FINANCIAL_DETAILS');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle(lang);
      expect(nextStepsTitle[0]?.data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE');
      expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_ASK_MEDIATION');
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_DONT_WANT_MEDIATION');
      expect(nextStepsSection[5].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.REJECT_OFFER_TO_PAY_BY');
      expect(nextStepsSection[6].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });

    it('should display next steps section when carm is applicable and small claim', () => {
      claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang, true);
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE');
      expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1');
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
    });

    it('should display next steps section with no mediation', () => {
      // Given
      claim.mediation = <Mediation>{mediationDisagreement: {option: YesNo.NO}};
      // When
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      // Then
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE');
      expect(nextStepsSection[3]).toBeUndefined();
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE');
      expect(nextStepsSection[5].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.REJECT_OFFER_TO_PAY_BY');
      expect(nextStepsSection[6].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });
  });

  describe('Partial admission pay by set date scenario', () => {
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
    claim.applicant1.type = PartyType.COMPANY;

    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
    claim.respondent1.type = PartyType.INDIVIDUAL;
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;

    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE');
      expect(submitStatusSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.SENT_EXPLANATION');
      expect(submitStatusSection[2].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
    });

    it('should display financial details in status if type isBussines', () => {
      if (claim.respondent1) {
        claim.respondent1.type = PartyType.ORGANISATION;
      }
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE');
      expect(submitStatusSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.SENT_EXPLANATION');
      expect(submitStatusSection[2].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
      expect(submitStatusSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.SEND_FINANCIAL_DETAILS');
      expect(submitStatusSection[4].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.SEND_STATEMENT_OF_ACC');
      expect(submitStatusSection[5].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.GET_FINANCIAL_DETAILS');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle(lang);
      expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    });

    it('should display next steps section', () => {
      // When
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      // Then
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.PAY_BY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CHEQUES_OR_BANK_TRANSFERS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.MAKE_SURE_GET_RECEIPT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.ASK_SIGN_SETTLEMENT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE');
      expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_ASK_MEDIATION');
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_DONT_WANT_MEDIATION');
      expect(nextStepsSection[5].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.REJECT_OFFER_TO_PAY_BY');
      expect(nextStepsSection[6].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });

    it('should display next steps section when carm is applicable and small claim', () => {
      // When
      claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang, true);
      // Then
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.PAY_BY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CHEQUES_OR_BANK_TRANSFERS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.MAKE_SURE_GET_RECEIPT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.ASK_SIGN_SETTLEMENT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE');
      expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1');
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
      expect(nextStepsSection[5].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.REJECT_OFFER_TO_PAY_BY');
      expect(nextStepsSection[6].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });

    it('should display next steps section with no mediation', () => {
      // Given
      claim.mediation = <Mediation>{mediationDisagreement: {option: YesNo.NO}};
      // When
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      // Then
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.PAY_BY');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CHEQUES_OR_BANK_TRANSFERS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.MAKE_SURE_GET_RECEIPT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.ASK_SIGN_SETTLEMENT');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU');
      expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE');
      expect(nextStepsSection[3]).toBeUndefined();
      expect(nextStepsSection[4].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE');
      expect(nextStepsSection[5].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.REJECT_OFFER_TO_PAY_BY');
      expect(nextStepsSection[6].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });
  });

  describe('Reject & Paid Amount Scenario', () => {

    const getClaim = () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
      claim.applicant1.type = PartyType.COMPANY;

      claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
      claim.respondent1.type = PartyType.ORGANISATION;
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;

      return claim;
    };

    describe('Paid Less Scenario', () => {
      const claim = getClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(
        RejectAllOfClaimType.ALREADY_PAID,
        new HowMuchHaveYouPaid({
          amount: 120,
          totalClaimAmount: 1000,
          year: '2022',
          month: '2',
          day: '14',
          text: 'Some text here...',
        }),
        new WhyDoYouDisagree(''),
        new Defence(),
      );
      claim.mediation = <Mediation>{mediationDisagreement: {option: YesNo.YES}};

      it('should display submit status', () => {
        const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
        expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      });

      it('should display what happens next title', () => {
        const nextStepsTitle = getNextStepsTitle(lang);
        expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      });

      it('should display next steps section', () => {
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.THE_CLAIM_WILL_BE_SETTLED');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_RESPONSE');
        expect(nextStepsSection[1].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_ASK_CLAIMANT_FOR_MEDIATION');
        expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.CLAIMANT_REFUSE_MEDIATION');
        expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT');
      });

      it('should display next steps section when carm is applicable and small claim', () => {
        claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang, true);
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.THE_CLAIM_WILL_BE_SETTLED');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_RESPONSE');
        expect(nextStepsSection[1].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1');
        expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
      });
    });

    describe('Paid Equal Scenario', () => {
      const totalClaimAmount = 1000;
      const paidAmountInPence = 1000;
      const claim = getClaim();
      claim.totalClaimAmount = totalClaimAmount;
      claim.rejectAllOfClaim = new RejectAllOfClaim(
        RejectAllOfClaimType.ALREADY_PAID,
        new HowMuchHaveYouPaid({
          amount: paidAmountInPence,
          totalClaimAmount: totalClaimAmount,
          year: '2022',
          month: '2',
          day: '14',
          text: 'Some text here...',
        }),
        new WhyDoYouDisagree(''),
        new Defence(),
      );

      it('should display submit status', () => {
        const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
        expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      });

      it('should display what happens next title', () => {
        const nextStepsTitle = getNextStepsTitle(lang);
        expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      });

      it('should display next steps section', () => {
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END');
        expect(nextStepsSection[1].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_TRY_MEDIATION');
        expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_COURT_WILL_REVIEW_CASE');
        expect(nextStepsSection[3].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT');
      });

      it('should display next steps section when carm is applicable and small claim', () => {
        claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang, true);
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END');
        expect(nextStepsSection[1].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.CLAIMANT_REJECTS_MEDIATION');
        expect(nextStepsSection[2].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
      });
    });

  });

  describe('Reject & Dispute Scenario', () => {

    const getClaim = () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
      claim.respondent1.type = PartyType.ORGANISATION;
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = new PartyDetails({partyName: 'Some Very Important Company Ltd'});
      claim.applicant1.type = PartyType.COMPANY;
      return claim;
    };

    describe('Dispute Scenario', () => {
      const claim = getClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(
        RejectAllOfClaimType.DISPUTE,
        new HowMuchHaveYouPaid({
          amount: 0,
          totalClaimAmount: 1000,
          year: '2022',
          month: '2',
          day: '14',
          text: 'Some text here...',
        }),
        new WhyDoYouDisagree(''),
        new Defence(),
      );

      it('should display submit status', () => {
        const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
        expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_HAVE_MAILED');
      });

      it('should display what happens next title', () => {
        const nextStepsTitle = getNextStepsTitle(lang);
        expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      });

      it('should display next steps section', () => {
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
        expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_WILL_CONTACT');
        expect(nextStepsSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_ACCEPTS');
        expect(nextStepsSection[2].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_REJECTS');
        expect(nextStepsSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_THEY_REJECT');
      });

      it('should display next steps section when isCarmApplicableAndSmallClaim(carmApplicable, claim)', () => {
        claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang, true);
        expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_WILL_CONTACT');
        expect(nextStepsSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_ACCEPTS');
        expect(nextStepsSection[2].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.CLAIMANT_REJECTS_MEDIATION');
        expect(nextStepsSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
      });
    });
  });
});
