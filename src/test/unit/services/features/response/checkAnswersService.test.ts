import {
  getSummarySections,
  saveStatementOfTruth,
} from '../../../../../main/services/features/response/checkAnswersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  DOB_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_PRIORITY_DEBTS_URL,
  CITIZEN_DEBTS_URL,
  CITIZEN_MONTHLY_EXPENSES_URL,
  CITIZEN_MONTHLY_INCOME_URL,
  CITIZEN_COURT_ORDERS_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../src/test/utils/errorMessageTestConstants';
import PaymentOptionType
  from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from '../../../../../main/common/models/signatureType';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithRespondentDetailsWithPaymentOption,
  createClaimWithIndividualDetails,
  createClaimWithContactPersonDetails,
  createClaimWithOneBankAccount,
  createClaimWithBankAccounts,
  createClaimWithCourtOrders,
  createClaimWithNoCourtOrders,
  createClaimWithDebts,
  createClaimWithPriorityDebts,
  createClaimWithMultipleDebt,
  createClaimWithRegularExpenses,
  createClaimWithRegularIncome,
} from '../../../../utils/mockClaimForCheckAnswers';
import { Claim } from '../../../../../main/common/models/claim';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const CONTACT_PERSON = 'The Post Man';
const PARTY_NAME = 'Nice organisation';
const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const FULL_NAME = `${TITLE} ${FIRST_NAME} ${LAST_NAME}`;
const CONTACT_NUMBER = '077777777779';
const ADDRESS = '23 Brook lane<br>Bristol<br>BS13SS';
const CORRESPONDENCE_ADDRESS = '24 Brook lane<br>Bristol<br>BS13SS';
const DOB = '12 December 2000';
const CLAIM_ID = 'claimId';

const PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT = 'PAGES.CHECK_YOUR_ANSWER.BANK_TYPE_OF_ACCOUNT';
const PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE = 'PAGES.CHECK_YOUR_ANSWER.BANK_BALANCE';
const PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT = 'PAGES.CHECK_YOUR_ANSWER.BANK_JOINT_ACCOUNT';
const PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE = 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_TYPE';
const PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT = 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ARREARS_REPAYMENT';


describe('Check Answers service', () => {
  describe('Get Summary Sections', () => {
    const claim = createClaimWithBasicRespondentDetails();
    it('should return your details summary sections', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections.length).toBe(3);
      expect(summarySections.sections[0].summaryList.rows.length).toBe(5);
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe(PARTY_NAME);
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe(ADDRESS);
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS');
      expect(summarySections.sections[0].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[4].value.html).toBe(CONTACT_NUMBER);
      expect(summarySections.sections[0].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_PHONE_NUMBER_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[3].value.html).toBe(DOB);
      expect(summarySections.sections[0].summaryList.rows[3].actions?.items[0].href).toBe(DOB_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].title).toBe('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE');
      expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
      expect(summarySections.sections[0].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER');
    });

    it('should return your financial details section', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      expect(summarySections.sections[1].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].title).toBe('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE');
    });

    it('should return your response summary section', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[2].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[2].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[2].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[2].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[2].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PAYMENT_OPTION_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[2].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');
      expect(summarySections.sections[2].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
      expect(summarySections.sections[2].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
    });

    it('should return response summary section with payment option type instalments', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[2].summaryList.rows.length).toBe(5);
      expect(summarySections.sections[2].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
      expect(summarySections.sections[2].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[2].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS');
      expect(summarySections.sections[2].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY');
      expect(summarySections.sections[2].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT');
      expect(summarySections.sections[2].summaryList.rows[4].key.text).toBe('PAGES.EXPLANATION.TITLE');
    });
    it('should return response summary section with payment option by set date', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[2].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[2].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
      expect(summarySections.sections[2].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[2].summaryList.rows[1].key.text).toBe('PAGES.EXPLANATION.TITLE');
      expect(summarySections.sections[2].summaryList.rows[0].value.html).toContain('COMMON.PAYMENT_OPTION.BY_SET_DATE: 25 June 2022');
    });
    it('should throw error when retrieving data from draft store fails', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(SignatureType.BASIC, 'true'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.defendantStatementOfTruth = { type: SignatureType.BASIC, signed: 'true' };
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(SignatureType.BASIC, 'true'))).toBeTruthy();
    });
    it('should return full name of a person when full name is present', async () => {
      //Given
      const claim = createClaimWithIndividualDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe(FULL_NAME);
    });
    it('should return contact person when contact person is specified', async () => {
      //Given
      const claim = createClaimWithContactPersonDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe(CONTACT_PERSON);
    });
    it('should return correspondence address when it exists', async () => {
      //Given
      const claim = createClaimWithIndividualDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe(CORRESPONDENCE_ADDRESS);
    });

    it('should return bank accounts and show it without list number when it exists only one', async () => {
      //Given
      const claim = createClaimWithOneBankAccount();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[1].value.html).toBe('Current account');
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[1].summaryList.rows[2].value.html).toBe('£1,000');
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

    });

    it('should return bank accounts when it exists', async () => {
      //Given
      const claim = createClaimWithBankAccounts();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS');
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[1].value.html).toBe('Current account');
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[1].summaryList.rows[2].value.html).toBe('£1,000');
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('Saving account');
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('£2,000');
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('3. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('ISA');
      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£2,000');
      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe('4. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('Other');
      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£2,000');
      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));
    });

    it('should return court orders when it exists', async () => {
      //Given
      const claim = createClaimWithCourtOrders();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
      expect(summarySections.sections[1].summaryList.rows[1].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_CLAIM_NUMBER');
      expect(summarySections.sections[1].summaryList.rows[2].value.html).toBe('1');
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_AMOUNT_OWNED');
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('£100');
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_MONTHLY_INSTALMENT');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('£1,500');

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_CLAIM_NUMBER');
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('2');
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_AMOUNT_OWNED');
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£250');
      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_MONTHLY_INSTALMENT');
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£2,500');

    });

    it('should display "No" when court orders checkbox is set to no', async () => {
      //Given
      const claim = createClaimWithNoCourtOrders();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
      expect(summarySections.sections[1].summaryList.rows[1].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
    });

    it('should return priority debts when it exists', async () => {
      //Given
      const claim = createClaimWithPriorityDebts();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBTS_YOU_ARE_BEHIND_ON');
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MORTGAGE');
      expect(summarySections.sections[1].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[3].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_RENT');
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£2,000');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('3. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_COUNCIL_TAX');
      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£500.55');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('4. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_GAS');
      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£300');

      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe('5. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ELECTRICITY');
      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe('£400');

      expect(summarySections.sections[1].summaryList.rows[13].key.text).toBe('6. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[13].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_WATER');
      expect(summarySections.sections[1].summaryList.rows[14].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[14].value.html).toBe('£500');

      expect(summarySections.sections[1].summaryList.rows[15].key.text).toBe('7. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[15].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MAINTENANCE');
      expect(summarySections.sections[1].summaryList.rows[16].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[16].value.html).toBe('£500');
    });

    it('should return loans or credit card debts when it exists', async () => {
      //Given
      const claim = createClaimWithDebts();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_LOANS_OR_CREDIT_CARDS');
      expect(summarySections.sections[1].summaryList.rows[2].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
      expect(summarySections.sections[1].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_DEBTS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[2].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBT');
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Loan 1');
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('£1,000');
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS');
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('£10');
    });

    it('should return multiple loans or credit card debts and show it with list number when it exists', async () => {
      //Given
      const claim = createClaimWithMultipleDebt();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('1. PAGES.CHECK_YOUR_ANSWER.DEBT');
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Loan 1');
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('£1,000');
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS');
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('£10');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('2. PAGES.CHECK_YOUR_ANSWER.DEBT');
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('Loan 2');
      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED');
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£2,000');
      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS');
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£10');
    });

    it('should return monthly expenses when it exists', async () => {
      //Given
      const claim = createClaimWithRegularExpenses();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSES_REGULAR');
      expect(summarySections.sections[1].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_MONTHLY_EXPENSES_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[3].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_RENT');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('£300');

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_COUNCIL_TAX');
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('£10,000');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_GAS');
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£100');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_ELECTRICITY');
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£100');

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_WATER');
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£400');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TRAVEL');
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('£500');

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_SCHOOL_COSTS');
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£600');

      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_FOOD_AND_HOUSEKEEPING');
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£700');

      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TV_BROADBAND');
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe('£500.50');

      expect(summarySections.sections[1].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_HIRE_PURCHASE');
      expect(summarySections.sections[1].summaryList.rows[13].value.html).toBe('£44.40');

      expect(summarySections.sections[1].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MOBILE_PHONE');
      expect(summarySections.sections[1].summaryList.rows[14].value.html).toBe('£25');

      expect(summarySections.sections[1].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MAINTENANCE');
      expect(summarySections.sections[1].summaryList.rows[15].value.html).toBe('£120');

      expect(summarySections.sections[1].summaryList.rows[16].key.text).toBe('Expenses 1');
      expect(summarySections.sections[1].summaryList.rows[16].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[17].key.text).toBe('Expenses 2');
      expect(summarySections.sections[1].summaryList.rows[17].value.html).toBe('£2,000');
    });

    it('should return monthly incomes when it exists', async () => {
      //Given
      const claim = createClaimWithRegularIncome();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_REGULAR');
      expect(summarySections.sections[1].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_MONTHLY_INCOME_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[2].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB');
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_UNIVERSAL_CREDIT');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe('£200');

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE');
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('£300');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE_CONTRIBUTION');
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£350.50');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_SUPPORT');
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£475.33');

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_WORKING_TAX_CREDIT');
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£400.70');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_TAX_CREDIT');
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('£550.50');

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_BENEFIT');
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£600');

      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_COUNCIL_TAX_SUPPORT');
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£10');

      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_PENSION');
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe('£247');

      expect(summarySections.sections[1].summaryList.rows[13].key.text).toBe('Income 1');
      expect(summarySections.sections[1].summaryList.rows[13].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[14].key.text).toBe('Income 2');
      expect(summarySections.sections[1].summaryList.rows[14].value.html).toBe('£2,000');
    });

  });
});
