import {Claim} from '../../../../../../main/common/models/claim';
import {
  buildSubmitStatus,
  buildNextStepsSection,
} from '../../../../../../main/services/features/response/submitConfirmation/submitConfirmationBuilder/submitConfirmationBuilder';
import {getNextStepsTitle} from '../../../../../../main/services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {Respondent} from '../../../../../../main/common/models/respondent';
import PaymentOptionType from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {HowMuchHaveYouPaid} from '../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaim} from '../../../../../../main/common/form/models/rejectAllOfClaim';
import {WhyDoYouDisagree} from '../../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Defence} from '../../../../../../main/common/form/models/defence';
import RejectAllOfClaimType from '../../../../../../main/common/form/models/rejectAllOfClaimType';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Submit Confirmation service', () => {
  const mockClaimId = '5129';
  const lang = 'en';

  describe('Full admission pay immediately scenario', () => {
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.IMMEDIATELY;
    claim.paymentDate = new Date('2035-06-01T00:00:00.000Z');
    claim.respondent1 = new Respondent();
    claim.applicant1 = {
      partyName: 'Some Very Important Company Ltd',
      type: CounterpartyType.COMPANY,
    };
    claim.respondent1.partyName = 'Version 1';
    claim.respondent1.type = CounterpartyType.ORGANISATION;
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
      expect(nextStepsSection[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.CONTACT_CLAIMANT');
      expect(nextStepsSection[1].data?.textAfter).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.IF_NEED_THEIR_DETAILS');
      expect(nextStepsSection[1].data?.href).toEqual('/dashboard/5129/contact-them');
    });
  });

  describe('Full admission pay by date scenario', () => {
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.respondent1 = new Respondent();
    claim.applicant1 = {
      partyName: 'Some Very Important Company Ltd',
      type: CounterpartyType.COMPANY,
    };
    claim.respondent1.partyName = 'Version 1';
    claim.respondent1.type = CounterpartyType.ORGANISATION;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
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
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.PAY_CLAIMANT_BY_DATE');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.IF_NEED_THEIR_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_CCJ_AGAINST_YOU');
      expect(nextStepsSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER');
      expect(nextStepsSection[4].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });
  });

  describe('Full admission pay by installment scenario', () => {
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.respondent1 = new Respondent();
    claim.applicant1 = {
      partyName: 'Some Very Important Company Ltd',
      type: CounterpartyType.COMPANY,
    };
    claim.respondent1.partyName = 'Version 1';
    claim.respondent1.type = CounterpartyType.ORGANISATION;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
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
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.YOU_SHOULD');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_INSTALLMENTS.SETUP_REPAYMENT_PLAN');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.CONTACT_THEM');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.IF_NEED_THEIR_DETAILS');
      expect(nextStepsSection[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_INSTALLMENTS.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT');
      expect(nextStepsSection[2].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.REQUEST_CCJ_AGAINST_YOU');
      expect(nextStepsSection[3].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER');
      expect(nextStepsSection[4].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
    });
  });

  describe('Reject & Paid Amount Scenario', () => {

    const getClaim = () => {
      const claim = new Claim();
      claim.respondent1 = new Respondent();
      claim.applicant1 = {
        partyName: 'Some Very Important Company Ltd',
        type: CounterpartyType.COMPANY,
      };
      claim.respondent1.partyName = 'Version 1';
      claim.respondent1.type = CounterpartyType.ORGANISATION;
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
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_ASK_CLAIMANT_FOR_MEDIATION');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.CLAIMANT_REFUSE_MEDIATION');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT');
      });
    });

    describe('Paid Equal Scenario', () => {
      const claim = getClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(
        RejectAllOfClaimType.ALREADY_PAID,
        new HowMuchHaveYouPaid({
          amount: 1000,
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
        expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      });

      it('should display what happens next title', () => {
        const nextStepsTitle = getNextStepsTitle(lang);
        expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      });

      it('should display next steps section', () => {
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_TRY_MEDIATION');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_COURT_WILL_REVIEW_CASE');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT');
      });
    });

  });

  describe('Reject & Dispute Scenario', () => {

    const getClaim = () => {
      const claim = new Claim();
      claim.respondent1 = new Respondent();
      claim.applicant1 = {
        partyName: 'Some Very Important Company Ltd',
        type: CounterpartyType.COMPANY,
      };
      claim.respondent1.partyName = 'Version 1';
      claim.respondent1.type = CounterpartyType.ORGANISATION;
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;

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
        expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
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
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_ASK_CLAIMANT_FOR_MEDIATION');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.CLAIMANT_REFUSE_MEDIATION');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT');
      });
    });

    describe('Paid Equal Scenario', () => {
      const claim = getClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(
        RejectAllOfClaimType.ALREADY_PAID,
        new HowMuchHaveYouPaid({
          amount: 1000,
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
        expect(submitStatusSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      });

      it('should display what happens next title', () => {
        const nextStepsTitle = getNextStepsTitle(lang);
        expect(nextStepsTitle[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      });

      it('should display next steps section', () => {
        const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_TRY_MEDIATION');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_COURT_WILL_REVIEW_CASE');
        expect(nextStepsSection[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU_FOR_WHAT_TO_DO_NEXT');
      });
    });

  });
});

