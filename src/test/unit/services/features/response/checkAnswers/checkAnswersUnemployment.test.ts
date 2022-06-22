import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  createClaimWithUnemplymentDetailsOne,
  createClaimWithUnemplymentDetailsTwo,
  createClaimWithUnemploymentCategoryRETIRED,
  createClaimWithUnemploymentCategoryOTHER,
} from '../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Unemployemt Details', () => {
  it('should return unemployment details with signle year/month when it exists', async () => {
    //Given
    const claim = createClaimWithUnemplymentDetailsOne();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DO_YOU_HAVE_A_JOB);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Unemployed for 1 year 1 month');

  });

  it('should return unemployment details with multiple years/months when it exists', async () => {
    //Given
    const claim = createClaimWithUnemplymentDetailsTwo();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Unemployed for 10 years 10 months');
  });

  it('should return unemployment details with unemployment category equal to "Retired" when it exists', async () => {
    //Given
    const claim = createClaimWithUnemploymentCategoryRETIRED();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Retired');
  });

  it('should return unemployment details with unemployment category equal to "Other" when it exists', async () => {
    //Given
    const claim = createClaimWithUnemploymentCategoryOTHER();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Other details here');
  });
});
