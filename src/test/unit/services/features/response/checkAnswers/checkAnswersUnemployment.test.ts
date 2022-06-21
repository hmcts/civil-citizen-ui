import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  createClaimWithUnemplymentDetailsOne,
  createClaimWithUnemplymentDetailsTwo,
  createClaimWithUnemploymentCategoryRETIRED,
  createClaimWithUnemploymentCategoryOTHER,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_ID,INDEX_FINANCIAL_SECTION} from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_TYPE';

describe('Unemployemt Details', () => {
  it('should return unemployment details with signle year/month when it exists', async () => {
    //Given
    const claim = createClaimWithUnemplymentDetailsOne();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Unemployed for 1 year 1 month');

  });

  it('should return unemployment details with multiple years/months when it exists', async () => {
    //Given
    const claim = createClaimWithUnemplymentDetailsTwo();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Unemployed for 10 years 10 months');
  });

  it('should return unemployment details with unemployment category equal to "Retired" when it exists', async () => {
    //Given
    const claim = createClaimWithUnemploymentCategoryRETIRED();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Retired');
  });

  it('should return unemployment details with unemployment category equal to "Other" when it exists', async () => {
    //Given
    const claim = createClaimWithUnemploymentCategoryOTHER();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Other details here');
  });
});
