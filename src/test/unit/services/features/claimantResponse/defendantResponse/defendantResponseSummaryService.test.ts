import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {ResponseType} from 'common/form/models/responseType';
import {PartyType} from 'common/models/partyType';
import {Party} from 'common/models/party';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {
  getDefendantsResponseContent, getResponseContentForHowTheyWantToPay,
} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {mockClaim} from '../../../../../utils/mockClaim';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import howMuchHaveYouPaidService from 'services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';

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
    claim.fullAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: 'MONTH',
      firstRepaymentDate: new Date(Date.now()),
    };

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

  describe('Full admission pay by installment', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.respondent1 = new Party();
    claim.statementOfMeans = new StatementOfMeans();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.fullAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: 'MONTH',
      firstRepaymentDate: new Date(Date.now()),
    };

    it('should display for individual', () => {
      // Given
      const reason = "I don't agree with the claim";
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = {partyName: 'Mr. John Doe'};
      claim.statementOfMeans.explanation = {text: reason};
      // When
      const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.DEFENDANT_ADMITS');
      expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.THEY_OFFERED_PAY');
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
    expect(defendantsResponseContent[5].data?.tableRows[0][0].text).toEqual('1 April 2022');
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

  describe('Part admission - Not Paid', () => {
    const claim = mockClaim;
    beforeAll(() => {
      claim.partialAdmission.alreadyPaid = {
        'option': 'no',
      };
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(700,1200);
      claim.partialAdmission.whyDoYouDisagree = {
        text: 'disagree text',
      };
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    });
    it('Part admission - Not paid - Instalments scenario', () => {
      // Given
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      // When
      const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE');
      expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU');
      expect(defendantsResponseContent[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE');
      expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.WHY_THEY_DONT_OWE');
      expect(defendantsResponseContent[4].data?.text).toEqual('disagree text');
      expect(defendantsResponseContent[5].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
      expect(defendantsResponseContent[6].data?.head[0].text).toEqual('COMMON.DATE');
      expect(defendantsResponseContent[6].data?.head[1].text).toEqual('COMMON.TIMELINE.WHAT_HAPPENED');
      expect(defendantsResponseContent[6].data?.tableRows[0][0].text).toEqual('1 April 2022');
      expect(defendantsResponseContent[6].data?.tableRows[0][1].text).toEqual('I contacted Mary Richards to discuss building works on our roof.');
      expect(defendantsResponseContent[7].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE');
      expect(defendantsResponseContent[8].data?.text).toEqual('timeline comments');
      expect(defendantsResponseContent[9].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
      expect(defendantsResponseContent[10].data?.head[0].text).toEqual('COMMON.EVIDENCE_SUMMARY.ROW_TYPE');
      expect(defendantsResponseContent[10].data?.head[1].text).toEqual('COMMON.DESCRIPTION');
      expect(defendantsResponseContent[10].data?.tableRows[0][0].text).toEqual('Contracts and agreements');
      expect(defendantsResponseContent[10].data?.tableRows[0][1].text).toEqual('I have a signed contract showing that you broke the contract agreement.');
      expect(defendantsResponseContent[11].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE');
      expect(defendantsResponseContent[12].data?.text).toEqual('evidence comments');
    });

    it('Part admission - Not paid - Immediately', () => {
      // Given
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      // When
      const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE');
      expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_IMMEDIATELY');
      expect(defendantsResponseContent[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE');
      expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.WHY_THEY_DONT_OWE');
      expect(defendantsResponseContent[4].data?.text).toEqual('disagree text');
      expect(defendantsResponseContent[5].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
      expect(defendantsResponseContent[6].data?.head[0].text).toEqual('COMMON.DATE');
      expect(defendantsResponseContent[6].data?.head[1].text).toEqual('COMMON.TIMELINE.WHAT_HAPPENED');
      expect(defendantsResponseContent[6].data?.tableRows[0][0].text).toEqual('1 April 2022');
      expect(defendantsResponseContent[6].data?.tableRows[0][1].text).toEqual('I contacted Mary Richards to discuss building works on our roof.');
      expect(defendantsResponseContent[7].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE');
      expect(defendantsResponseContent[8].data?.text).toEqual('timeline comments');
      expect(defendantsResponseContent[9].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
      expect(defendantsResponseContent[10].data?.head[0].text).toEqual('COMMON.EVIDENCE_SUMMARY.ROW_TYPE');
      expect(defendantsResponseContent[10].data?.head[1].text).toEqual('COMMON.DESCRIPTION');
      expect(defendantsResponseContent[10].data?.tableRows[0][0].text).toEqual('Contracts and agreements');
      expect(defendantsResponseContent[10].data?.tableRows[0][1].text).toEqual('I have a signed contract showing that you broke the contract agreement.');
      expect(defendantsResponseContent[11].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE');
      expect(defendantsResponseContent[12].data?.text).toEqual('evidence comments');
    });

    it('Part admission - Not paid - By date', () => {
      // Given
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      // When
      const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE');
      expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE');
      expect(defendantsResponseContent[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE');
      expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.WHY_THEY_DONT_OWE');
      expect(defendantsResponseContent[4].data?.text).toEqual('disagree text');
      expect(defendantsResponseContent[5].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
      expect(defendantsResponseContent[6].data?.head[0].text).toEqual('COMMON.DATE');
      expect(defendantsResponseContent[6].data?.head[1].text).toEqual('COMMON.TIMELINE.WHAT_HAPPENED');
      expect(defendantsResponseContent[6].data?.tableRows[0][0].text).toEqual('1 April 2022');
      expect(defendantsResponseContent[6].data?.tableRows[0][1].text).toEqual('I contacted Mary Richards to discuss building works on our roof.');
      expect(defendantsResponseContent[7].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE');
      expect(defendantsResponseContent[8].data?.text).toEqual('timeline comments');
      expect(defendantsResponseContent[9].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
      expect(defendantsResponseContent[10].data?.head[0].text).toEqual('COMMON.EVIDENCE_SUMMARY.ROW_TYPE');
      expect(defendantsResponseContent[10].data?.head[1].text).toEqual('COMMON.DESCRIPTION');
      expect(defendantsResponseContent[10].data?.tableRows[0][0].text).toEqual('Contracts and agreements');
      expect(defendantsResponseContent[10].data?.tableRows[0][1].text).toEqual('I have a signed contract showing that you broke the contract agreement.');
      expect(defendantsResponseContent[11].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE');
      expect(defendantsResponseContent[12].data?.text).toEqual('evidence comments');
    });

    it('Part admission - Not paid - By date - how they want to pay page', () => {
      // Given
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      // When
      const defendantsResponseContent = getResponseContentForHowTheyWantToPay(claim, lang);
      // Then
      expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE');
    });
  });

  describe('Part admission already paid scenario', () => {
    // Given
    const claim = mockClaim;
    claim.partialAdmission.alreadyPaid = {
      'option': 'yes',
    };
    claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
      amount: 20,
      totalClaimAmount: 110,
      year: '2020',
      month: '1',
      day: '1',
      text: 'text',
    });
    claim.partialAdmission.whyDoYouDisagree = {
      text: 'disagree text',
    };
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    // When
    const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
    // Then
    expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_ALREADY_PAID_STATEMENT');
    expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_SAY_THEY_PAID');
    expect(defendantsResponseContent[2].data?.text).toEqual('1 January 2020');
    expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_PAID');
    expect(defendantsResponseContent[4].data?.text).toEqual('text');
    expect(defendantsResponseContent[5].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_AMOUNT');
    expect(defendantsResponseContent[6].data?.text).toEqual('disagree text');
    expect(defendantsResponseContent[7].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
    expect(defendantsResponseContent[8].data?.head[0].text).toEqual('COMMON.DATE');
    expect(defendantsResponseContent[8].data?.head[1].text).toEqual('COMMON.TIMELINE.WHAT_HAPPENED');
    expect(defendantsResponseContent[8].data?.tableRows[0][0].text).toEqual('1 April 2022');
    expect(defendantsResponseContent[8].data?.tableRows[0][1].text).toEqual('I contacted Mary Richards to discuss building works on our roof.');
    expect(defendantsResponseContent[9].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE');
    expect(defendantsResponseContent[10].data?.text).toEqual('timeline comments');
    expect(defendantsResponseContent[11].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
    expect(defendantsResponseContent[12].data?.head[0].text).toEqual('COMMON.EVIDENCE_SUMMARY.ROW_TYPE');
    expect(defendantsResponseContent[12].data?.head[1].text).toEqual('COMMON.DESCRIPTION');
    expect(defendantsResponseContent[12].data?.tableRows[0][0].text).toEqual('Contracts and agreements');
    expect(defendantsResponseContent[12].data?.tableRows[0][1].text).toEqual('I have a signed contract showing that you broke the contract agreement.');
    expect(defendantsResponseContent[13].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE');
    expect(defendantsResponseContent[14].data?.text).toEqual('evidence comments');
  });

  describe('Full dispute Paid less scenario', () => {
    // Given
    const claim = mockClaim;
    const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(20, 40, '2040', '1', '1', 'I paid half');
    claim.rejectAllOfClaim = {
      'option': 'alreadyPaid',
      'howMuchHaveYouPaid': howMuchHaveYouPaid,

    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;

    // When
    const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
    // Then
    expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_PAID_LESS_STATEMENT');
    expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_PAID_THIS_AMOUNT');
    expect(defendantsResponseContent[2].data?.text).toEqual('1 January 2040');
    expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_THEY_PAID');
    expect(defendantsResponseContent[4].data?.text).toEqual('I paid half');
    expect(defendantsResponseContent[5].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEY_DONT_OWE_CLAIM_AMOUNT');
    expect(defendantsResponseContent[7].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
    expect(defendantsResponseContent[8].data?.head[0].text).toEqual('COMMON.DATE');
    expect(defendantsResponseContent[8].data?.head[1].text).toEqual('COMMON.TIMELINE.WHAT_HAPPENED');
    expect(defendantsResponseContent[8].data?.tableRows[0][0].text).toEqual('1 April 2022');
    expect(defendantsResponseContent[8].data?.tableRows[0][1].text).toEqual('I contacted Mary Richards to discuss building works on our roof.');
    expect(defendantsResponseContent[9].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE');
    expect(defendantsResponseContent[10].data?.text).toEqual('timeline comments');
    expect(defendantsResponseContent[11].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
    expect(defendantsResponseContent[12].data?.head[0].text).toEqual('COMMON.EVIDENCE_SUMMARY.ROW_TYPE');
    expect(defendantsResponseContent[12].data?.head[1].text).toEqual('COMMON.DESCRIPTION');
    expect(defendantsResponseContent[12].data?.tableRows[0][0].text).toEqual('Contracts and agreements');
    expect(defendantsResponseContent[12].data?.tableRows[0][1].text).toEqual('I have a signed contract showing that you broke the contract agreement.');
    expect(defendantsResponseContent[13].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE');
    expect(defendantsResponseContent[14].data?.text).toEqual('evidence comments');
  });

  describe('Full dispute Paid full scenario', () => {
    // Given
    const claim = mockClaim;
    const totalClaimAmount = 4000;
    const paidAmountInPence = 4000;
    claim.totalClaimAmount = totalClaimAmount;
    const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(paidAmountInPence, totalClaimAmount, '2040', '1', '1', 'Cash');
    claim.rejectAllOfClaim = {
      'option': 'alreadyPaid',
      'howMuchHaveYouPaid': howMuchHaveYouPaid,

    };
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;

    // When
    const defendantsResponseContent = getDefendantsResponseContent(claim, lang);
    // Then
    expect(defendantsResponseContent[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_PAID_FULL_STATEMENT');
    expect(defendantsResponseContent[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_PAID_THIS_AMOUNT');
    expect(defendantsResponseContent[2].data?.text).toEqual('1 January 2040');
    expect(defendantsResponseContent[3].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_THEY_PAID');
    expect(defendantsResponseContent[4].data?.text).toEqual('Cash');
    expect(defendantsResponseContent[5]).toBeUndefined();
  });
});
