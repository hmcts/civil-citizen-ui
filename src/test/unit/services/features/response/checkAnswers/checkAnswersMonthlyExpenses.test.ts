import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_MONTHLY_EXPENSES_URL,
} from '../../../../../../main/routes/urls';
import {
  createClaimWithRegularExpenses,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_ID,INDEX_FINANCIAL_SECTION} from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Monthly Expenses Details', () => {
  it('should return monthly expenses when it exists', async () => {
    //Given
    const claim = createClaimWithRegularExpenses();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSES_REGULAR');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].actions?.items[0].href).toBe(CITIZEN_MONTHLY_EXPENSES_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_RENT');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('£300');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_COUNCIL_TAX');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£10,000');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_GAS');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('£100');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_ELECTRICITY');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('£100');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_WATER');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('£400');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TRAVEL');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe('£500');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_SCHOOL_COSTS');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[13].value.html).toBe('£600');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_FOOD_AND_HOUSEKEEPING');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[14].value.html).toBe('£700');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TV_BROADBAND');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[15].value.html).toBe('£500.50');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[16].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_HIRE_PURCHASE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[16].value.html).toBe('£44.40');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[17].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MOBILE_PHONE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[17].value.html).toBe('£25');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[18].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MAINTENANCE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[18].value.html).toBe('£120');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[19].key.text).toBe('Expenses 1');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[19].value.html).toBe('£1,000');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[20].key.text).toBe('Expenses 2');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[20].value.html).toBe('£2,000');
  });
});
