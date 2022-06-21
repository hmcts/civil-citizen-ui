import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_BANK_ACCOUNT_URL,
} from '../../../../../../main/routes/urls';

import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {
  createClaimWithOneBankAccount,
  createClaimWithBankAccounts,
  createClaimWithNoBankAccounts,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_ID,INDEX_FINANCIAL_SECTION} from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT = 'PAGES.CHECK_YOUR_ANSWER.BANK_TYPE_OF_ACCOUNT';
const PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE = 'PAGES.CHECK_YOUR_ANSWER.BANK_BALANCE';
const PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT = 'PAGES.CHECK_YOUR_ANSWER.BANK_JOINT_ACCOUNT';

describe('Banck Account Details', () => {
  it('should return bank accounts and show it without list number when it exists only one', async () => {
    //Given
    const claim = createClaimWithOneBankAccount();

    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('Current account');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('£1,000');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

  });

  it('should return bank accounts when it exists', async () => {
    //Given
    const claim = createClaimWithBankAccounts();

    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('Current account');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('£1,000');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('Saving account');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('£2,000');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('3. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('ISA');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£2,000');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe('4. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('Other');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('£2,000');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));
  });

  it('should return bank accounts when it exists', async () => {
    //Given
    const claim = createClaimWithNoBankAccounts();

    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('None');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
  });
});
