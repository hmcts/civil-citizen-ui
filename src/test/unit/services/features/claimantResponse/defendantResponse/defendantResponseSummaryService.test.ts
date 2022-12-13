import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {ResponseType} from 'common/form/models/responseType';
import {PartyType} from 'common/models/partyType';
import {Party} from 'common/models/party';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {getDefendantsResponseContent} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {mockClaim} from '../../../../../utils/mockClaim';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe("Defendant's response summary service", () => {
  const lang = 'en';
  describe('Full admission pay by date scenario', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentDate = new Date();
    claim.respondent1 = new Party();
    claim.statementOfMeans = new StatementOfMeans();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    const repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: 'MONTH',
      firstRepaymentDate: new Date(Date.now()),
    };
    claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;

    it('should display for individual', () => {
      // Given
      const reason = "I don't agree with the claim";
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = {partyName: 'Mr. John Doe'};
      claim.statementOfMeans.explanation = {text: reason};
      // When
      const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION');
      expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.TOTAL_PAID_AMOUNT');
      expect(defendantsResponseContent[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PAYMENT_DATE');
      expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.UNABLE_TO_PAY_FULL_AMOUNT');
      expect(defendantsResponseContent[4].data?.text).toEqual(reason);

    });

    it('should display for organisation/company', () => {
      // Given
      claim.respondent1.type = PartyType.ORGANISATION;
      claim.respondent1.partyDetails = {partyName: 'Google'};
      // When
      const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION');
      expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.TOTAL_PAID_AMOUNT');
      expect(defendantsResponseContent[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PAYMENT_DATE');
    });
  });

  describe('Full dispute scenario', () => {
    // Given
    const claim = mockClaim;
    claim.rejectAllOfClaim = {
      'option': 'dispute',
      'defence': {'text': 'disagree statement'},
    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    // When
    const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
    // Then
    expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_STATEMENT');
    expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE');
    expect(defendantsResponseContent[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_CLAIM');
    expect(defendantsResponseContent[3].data?.text).toEqual('disagree statement');
    expect(defendantsResponseContent[4].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
    expect(defendantsResponseContent[5].data?.head[0].text).toEqual('COMMON.DATE');
    expect(defendantsResponseContent[5].data?.head[1].text).toEqual('COMMON.TIMELINE.WHAT_HAPPENED');
    expect(defendantsResponseContent[5].data?.tableRows[0][0].text).toEqual('2022-04-01');
    expect(defendantsResponseContent[5].data?.tableRows[0][1].text).toEqual('I contacted Mary Richards to discuss building works on our roof.');
    expect(defendantsResponseContent[6].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE');
    expect(defendantsResponseContent[7].data?.text).toEqual('timeline comments');
    expect(defendantsResponseContent[8].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
    expect(defendantsResponseContent[9].data?.head[0].text).toEqual('COMMON.EVIDENCE_SUMMARY.ROW_TYPE');
    expect(defendantsResponseContent[9].data?.head[1].text).toEqual('COMMON.DESCRIPTION');
    expect(defendantsResponseContent[9].data?.tableRows[0][0].text).toEqual('Contracts and agreements');
    expect(defendantsResponseContent[9].data?.tableRows[0][1].text).toEqual('I have a signed contract showing that you broke the contract agreement.');
    expect(defendantsResponseContent[10].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE');
    expect(defendantsResponseContent[11].data?.text).toEqual('evidence comments');
  });
});
