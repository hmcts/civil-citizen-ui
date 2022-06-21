import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_MONTHLY_INCOME_URL,
} from '../../../../../../main/routes/urls';
import {
  createClaimWithRegularIncome,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_ID,INDEX_FINANCIAL_SECTION} from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Monthly Incomes Details', () => {
  it('should return monthly incomes when it exists', async () => {
    //Given
    const claim = createClaimWithRegularIncome();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_REGULAR');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_MONTHLY_INCOME_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE'); INDEX_FINANCIAL_SECTION
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('£1,000');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_UNIVERSAL_CREDIT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('£200');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£300');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE_CONTRIBUTION');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('£350.50');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_SUPPORT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('£475.33');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_WORKING_TAX_CREDIT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('£400.70');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_TAX_CREDIT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe('£550.50');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_BENEFIT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[13].value.html).toBe('£600');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_COUNCIL_TAX_SUPPORT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[14].value.html).toBe('£10');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_PENSION');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[15].value.html).toBe('£247');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[16].key.text).toBe('Income 1');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[16].value.html).toBe('£1,000');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[17].key.text).toBe('Income 2');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[17].value.html).toBe('£2,000');
  });
});
