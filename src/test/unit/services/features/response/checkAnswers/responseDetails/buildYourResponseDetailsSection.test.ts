import {
  getSummarySections,
} from 'services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
  CITIZEN_EVIDENCE_URL,
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_OWED_AMOUNT_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_TIMELINE_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
} from 'routes/urls';
import {
  ceateClaimWithPartialAdmission,
  createClaimWithBasicRespondentDetails,
  createClaimWithFullRejection,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {DefendantEvidence} from 'models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceType} from 'models/evidence/evidenceType';
import {YesNo} from 'form/models/yesNo';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {
  WhyDoYouDisagree,
} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {Defence} from 'form/models/defence';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Partial Admit - Response Details', () => {
  describe('Part Admit - Paid', () => {
    it('should return your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE');
    });

    it('should return "How much did you pay?" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_MONEY_PAID');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].value.html).toBe('£100');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

    });

    it('should return "When did you pay this amount?" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].value.html).toBe('14 February 2022');
    });

    it('should return "When did you pay the amount claimed?" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].key.text)
        .toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUNT_CLAIMED');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].value.html).toBe('Test details');
    });

    it('should return "Why do you disagree with the amount claimed?" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].value.html).toBe('Reasons for disagree');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_WHY_DO_YOU_DISAGREE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Your timeline of what happened (optional)" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TIMELINE_TITLE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_TIMELINE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[4].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Your timeline events" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].key.text).toBe('6 November 2022');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].value.html).toBe('Event 1');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_TIMELINE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].key.text).toBe('7 November 2022');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].value.html).toBe('Event 2');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].actions?.items[0].href).toBe(CITIZEN_TIMELINE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TIMELINE_COMMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[7].value.html).toBe('Comments about timeline');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[7].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Your timeline events" with no comments on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      const timeline: DefendantTimeline = new DefendantTimeline(
        [new TimelineRow(6, 11, 2022, 'Event 1')],
        '',
      );
      claim.partialAdmission = {
        timeline,
      };
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].key.text).toBe('6 November 2022');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].value.html).toBe('Event 1');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_TIMELINE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TIMELINE_COMMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].value.html).toBe('');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[6].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return empty section when timeline not added', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      const timeline: DefendantTimeline = new DefendantTimeline(
        [],
        '',
      );
      claim.partialAdmission = {
        timeline,
      };
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TIMELINE_TITLE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_TIMELINE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[4].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TIMELINE_COMMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].value.html).toBe('');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[5].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Your evidence (optional)" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[8].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[8].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Your evidence types" on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_CONTRACTS_AND_AGREEMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].value.html).toBe('Evidence details 1');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_CORRESPONDENCE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].value.html).toBe('Evidence details 2');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_EXPERT_WITNESS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[11].value.html).toBe('Evidence details 3');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[11].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[11].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_PHOTO');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[12].value.html).toBe('Evidence details 4');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[12].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[12].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_RECEIPTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[13].value.html).toBe('Evidence details 5');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[13].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[13].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_STATEMENT_OF_ACCOUNT');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[14].value.html).toBe('Evidence details 7');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[14].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[14].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.VIDENCE_OTHER');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[15].value.html).toBe('Evidence details 8');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[15].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[15].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[16].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_COMMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[16].value.html).toBe('Comments about their evidence');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[16].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[16].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Your evidence types" with no comments on your response details section', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      const defendantEvidence: DefendantEvidence = new Evidence(
        '',
        [
          new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'Evidence details 1'),
        ],
      );
      claim.evidence = defendantEvidence;
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_CONTRACTS_AND_AGREEMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].value.html).toBe('Evidence details 1');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_COMMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].value.html).toBe('');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[10].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return empty section when evidence not added', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.YES);
      const defendantEvidence: DefendantEvidence = new Evidence(
        '',
        [],
      );
      claim.evidence = defendantEvidence;
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[8].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[8].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_COMMENTS');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].value.html).toBe('');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].actions?.items[0].href).toBe(CITIZEN_EVIDENCE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[9].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });
  });

  describe('Part Admit - Not paid', () => {
    it('should return "How much money do you admit you owe?" when Part admit And not paid', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.NO);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');

      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_OWED_AMOUNT_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE');

      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_YOU_ADMIT_YOU_OWE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_OWED_AMOUNT_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });

    it('should return "Why do you disagree?" when Part admit and not paid', async () => {
      //Given
      const claim = ceateClaimWithPartialAdmission(YesNo.NO);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');

      //Then
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].value.html).toBe('Reasons for disagree');
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_WHY_DO_YOU_DISAGREE_URL.replace(':id', constVal.CLAIM_ID));
      expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
    });
  });
});

describe('Reject Claim - Response Details', () => {
  it('should return "How much have you paid?" when reject claim', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_HAVE_YOU_PAID');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].value.html).toBe('£100');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_FR_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return "When did you pay?" when reject claim', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].value.html).toBe('14 February 2022');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_FR_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return "How di you pay this amount?" when reject claim', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_DID_YOU_PAY_THIS_AMOUNT');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].value.html).toBe('details here...');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_FR_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return "Why do you disagree?" when reject claim', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].value.html).toBe('Reasons for disagree');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should not return "Why do you disagree?" when payment amount is equal to total cliam amount', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 1000);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_HAVE_YOU_PAID');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].value.html).toBe('£1,000');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_FR_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
  });
  it('should return your response details section without totalClaimAmount and amount', async () => {
    //Given
    const claim = createClaimWithBasicRespondentDetails();
    if (claim?.respondent1) {
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.FULL_DEFENCE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.DISPUTE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));

  });
  it('should return your response details section with totalClaimAmount and amount', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.DISPUTE, 100);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.FULL_DEFENCE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.DISPUTE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));
  });
  it('should return your response details section with rejection text', async () => {
    //Given
    const claim = createClaimWithBasicRespondentDetails();
    if (claim?.respondent1) {
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;
      claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree('test');
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.FULL_DEFENCE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.DISPUTE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));

  });

  it('should return your response details section with defence text', async () => {
    //Given
    const claim = createClaimWithBasicRespondentDetails();
    if (claim?.respondent1) {
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;
      claim.rejectAllOfClaim.defence = new Defence('test');
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.FULL_DEFENCE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.DISPUTE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));

  });

});
