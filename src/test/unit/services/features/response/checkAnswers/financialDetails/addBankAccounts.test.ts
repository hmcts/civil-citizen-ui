import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_BANK_ACCOUNT_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithOneBankAccount,
  createClaimWithBankAccounts,
  createClaimWithNoBankAccounts,
  createClaimWithRespondentDetailsWithPaymentOption,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {PaymentOptionType}
  from '../../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Bank Account Details', () => {
  it('should return your financial details section', async () => {
    //Given
    const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows.length).toBe(11);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].title).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_YOUR_FINANCIAL_DETAILS_TITLE);
  });

  it('should return bank accounts and show it without list number when it exists only one', async () => {
    //Given
    const claim = createClaimWithOneBankAccount();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');

    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('£1,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('COMMON.VARIATION_4.YES');

  });

  it('should return bank accounts when it exists', async () => {
    //Given
    const claim = createClaimWithBankAccounts();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('1. ' + constVal.PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('£1,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('COMMON.VARIATION_4.YES');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('2. ' + constVal.PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.SAVINGS_ACCOUNT');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('£2,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('COMMON.VARIATION_4.NO');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('3. ' + constVal.PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.ISA');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£2,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('COMMON.VARIATION_4.NO');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe('4. ' + constVal.PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.OTHER');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('£2,000');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe('COMMON.VARIATION_4.NO');
  });

  it('should return bank accounts when it exists', async () => {
    //Given
    const claim = createClaimWithNoBankAccounts();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');

    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('None');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });
});
