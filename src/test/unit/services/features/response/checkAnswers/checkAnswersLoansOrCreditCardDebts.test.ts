import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_DEBTS_URL,
} from '../../../../../../main/routes/urls';
import {
  createClaimWithDebts,
  createClaimWithMultipleDebt,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import * as constVal from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Loans or Credit Card Debts Details', () => {
  it('should return loans or credit card debts when it exists', async () => {
    //Given
    const claim = createClaimWithDebts();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DO_YOU_HAVE_A_JOB);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_TITLE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_LOANS_OR_CREDIT_CARDS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_DEBTS_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('Loan 1');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('£1,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£10');
  });

  it('should return multiple loans or credit card debts and show it with list number when it exists', async () => {
    //Given
    const claim = createClaimWithMultipleDebt();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');

    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('1. ' + constVal.PAGES_CHECK_YOUR_ANSWER_DEBT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('Loan 1');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('£1,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£10');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe('2. ' + constVal.PAGES_CHECK_YOUR_ANSWER_DEBT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('Loan 2');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('£2,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('£10');
  });
});
