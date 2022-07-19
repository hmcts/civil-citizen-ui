import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_PARTNER_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_PENSION_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithCohabiting,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));


describe('Partner Details', () => {

  it('should return if you live with a partner when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_DISABLED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_SEVERELY_DISABLED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PARTNER_DO_YOU_LIVE_WITH_A);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_PARTNER_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return if you don\'t live with a partner when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.NO,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('COMMON.NO');
  });

  it('should return if your partner is aged 18 or over when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_AGED_18_OR_OVER');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_PARTNER_AGE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return if your partner is not aged 18 or over when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.NO,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('COMMON.NO');
  });

  it('should return if your partner receive a pension when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PARTNER_DOES_RECEIVE_A_PENSION');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].actions?.items[0].href).toBe(CITIZEN_PARTNER_PENSION_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return if your partner do not receive a pension when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.NO,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('COMMON.NO');
  });

  it('should return if your partner is disabled when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_DISABLED');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].actions?.items[0].href).toBe(CITIZEN_PARTNER_DISABILITY_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return if your partner is not disabled when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.NO,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('COMMON.NO');
  });

  it('should return if your partner is severely disabled when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_SEVERELY_DISABLED');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].actions?.items[0].href).toBe(CITIZEN_PARTNER_SEVERE_DISABILITY_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return if your partner is not severely disabled when it exists', async () => {
    //Given
    const claim = createClaimWithCohabiting(YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.YES,YesNo.NO);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('COMMON.NO');
  });
});
