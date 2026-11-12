import * as constVal from '../../../../../utils/checkAnswersConstants';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {getSummarySections} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {ClaimantResponse} from 'models/claimantResponse';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {
  buildPartAdmitPayInstallmentsSummaryRows,
  buildPartAdmitPaySetDateSummaryRows,
} from 'services/features/claimantResponse/responseSection/buildYourResponseSection';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Full Defence - Your Response', () => {
  describe('Full Defence- Dispute the claim', () => {
    it('should return your response section', async () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.FULL_DEFENCE,
      };
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;

      claim.claimantResponse = new ClaimantResponse(),
      claim.claimantResponse.intentionToProceed = {
        option: YesNo.YES,
      };
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim);
      //Then
      expect(summarySections.sections[0].title).toBe('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE');
      expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM');
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe('COMMON.YES');
      expect(summarySections.sections[0].summaryList.rows[0].actions.items[0].href).toBe('/case/claimId/claimant-response/intention-to-proceed');

    });
  });
});

describe('Part Admission - Your Response', () => {
  describe('Part Admit- Pay Immediately ', () => {
    it('should return your response section : when claimant accept the amount', async () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.IMMEDIATELY } };
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {
        option: YesNo.YES,
      };
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim);
      //Then
      expect(summarySections.sections[0].title).toBe('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE');
      expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION');
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.I_ACCEPT_THIS_AMOUNT');
      expect(summarySections.sections[0].summaryList.rows[0].actions.items[0].href).toBe('/case/claimId/claimant-response/settle-admitted');

    });

    it('should return your response section : when claimant rejects the amount', async () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.IMMEDIATELY } };
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {
        option: YesNo.NO,
      };
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim);
      //Then
      expect(summarySections.sections[0].title).toBe('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE');
      expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION');
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.I_REJECT_THIS_AMOUNT');
      expect(summarySections.sections[0].summaryList.rows[0].actions.items[0].href).toBe('/case/claimId/claimant-response/settle-admitted');

    });
  });
});

describe('Claimant suggested payment plan - missing details', () => {
  it('should return empty instalment rows when the repayment plan is missing', () => {
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.INSTALMENTS};

    const rows = buildPartAdmitPayInstallmentsSummaryRows(claim, constVal.CLAIM_ID, 'en');

    expect(rows).toHaveLength(4);
    expect(rows[0].value.html).toBe('COMMON.PAYMENT_OPTION.INSTALMENTS');
    expect(rows[1].value.html).toBe('');
    expect(rows[2].value.html).toBe('');
    expect(rows[3].value.html).toBe('');
    expect(rows[3].actions.items[0].href).toBe('/case/claimId/claimant-response/settle-admitted');
  });

  it('should return the set date row without a date when the payment date is missing', () => {
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.BY_SET_DATE};

    const rows = buildPartAdmitPaySetDateSummaryRows(claim, constVal.CLAIM_ID, 'en');

    expect(rows).toHaveLength(1);
    expect(rows[0].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.IN_FULL');
  });
});
