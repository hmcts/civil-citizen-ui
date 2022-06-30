import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
} from '../../../../../../../main/routes/urls';
import {
  ceateClaimWithPartialAdmission,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Response Details', () => {
  it('should return your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE');
  });

  it('should return "How much did you pay?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
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
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].value.html).toBe('14 February 2022');
  });

  it('should return "How did you pay the amount claimed?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUT_CLAIMED');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].value.html).toBe('Test details');
  });

  it('should return "Why do you disagree with the amount claimed?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].value.html).toBe('Reasons for disagree');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });
});

