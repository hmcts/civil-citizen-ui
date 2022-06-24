import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_MONTHLY_EXPENSES_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithRegularExpenses,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Monthly Expenses Details', () => {
  it('should return monthly expenses when it exists', async () => {
    //Given
    const claim = createClaimWithRegularExpenses();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_DISABLED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PARTNER_DO_YOU_LIVE_WITH_A);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_SUPPORT_ANYONE_ELSE_FINANCIALLY);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CARER_CREDIT_DO_YOU_CLAIM);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DO_YOU_HAVE_A_JOB);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_TITLE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EXPENSES_REGULAR);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[13].actions?.items[0].href).toBe(CITIZEN_MONTHLY_EXPENSES_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_RENT');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].value.html).toBe('£300');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_COUNCIL_TAX');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[15].value.html).toBe('£10,000');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[16].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_GAS');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[16].value.html).toBe('£100');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[17].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_ELECTRICITY');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[17].value.html).toBe('£100');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[18].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_WATER');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[18].value.html).toBe('£400');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[19].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TRAVEL');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[19].value.html).toBe('£500');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[20].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_SCHOOL_COSTS');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[20].value.html).toBe('£600');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[21].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_FOOD_AND_HOUSEKEEPING');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[21].value.html).toBe('£700');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[22].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TV_BROADBAND');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[22].value.html).toBe('£500.50');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[23].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_HIRE_PURCHASE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[23].value.html).toBe('£44.40');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[24].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MOBILE_PHONE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[24].value.html).toBe('£25');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[25].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MAINTENANCE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[25].value.html).toBe('£120');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[26].key.text).toBe('Expenses 1');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[26].value.html).toBe('£1,000');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[27].key.text).toBe('Expenses 2');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[27].value.html).toBe('£2,000');
  });
});
