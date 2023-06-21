import {getSummarySections} from 'services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_EVIDENCE_URL, CLAIM_REASON_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {
  claimWithClaimAmountParticularDate,
  claimWithClaimTimeLineAndEvents,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {EvidenceType} from 'models/evidence/evidenceType';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Citizen Claim Section', () => {
  const claim = claimWithClaimAmountParticularDate();
  it('should return basic claim section', async () => {
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].title).toBe('PAGES.CLAIM_DETAILS.PAGE_TITLE');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REASON_TITLE');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[0].value.html).toBe(undefined);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_REASON_URL);
  });

  it('should return claim section with events and timelines', async () => {
    //Given
    const claim = claimWithClaimTimeLineAndEvents();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REASON_TITLE');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_REASON_URL);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[2].key.text).toBe('1 February 2000');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[2].value.html).toBe('contract');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[2].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CLAIM_TIMELINE_URL);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[3].key.text).toBe('1 February 2002');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[3].value.html).toBe('meeting');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[3].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CLAIM_TIMELINE_URL);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[4].key.text).toBe('1 February 1999');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[4].value.html).toBe('damages');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[4].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CLAIM_TIMELINE_URL);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[5].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CLAIM_EVIDENCE_URL);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[6].key.text).toBe(EvidenceType.CONTRACTS_AND_AGREEMENTS);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[6].value.html).toBe('roof');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[6].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[6].actions?.items[0].href).toBe(CLAIM_EVIDENCE_URL);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[7].key.text).toBe(EvidenceType.EXPERT_WITNESS);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[7].value.html).toBe('door');
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[7].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CLAIM_SECTION].summaryList.rows[7].actions?.items[0].href).toBe(CLAIM_EVIDENCE_URL);
  });
});
