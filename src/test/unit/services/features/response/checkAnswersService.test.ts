import {
  getSignatureType,
  getStatementOfTruth,
  getSummarySections,
  resetCheckboxFields,
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
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_SELF_EMPLOYED_URL,
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
  createClaimWithNoBankAccounts,
  createClaimWithCourtOrders,
  createClaimWithNoCourtOrders,
  createClaimWithDebts,
  createClaimWithPriorityDebts,
  createClaimWithMultipleDebt,
  createClaimWithRegularExpenses,
  createClaimWithRegularIncome,
  createClaimWithEmplymentDetails,
  createClaimWithEmployedCategory,
  createClaimWithSelfEmployedAndTaxBehind,
  createClaimWithSelfEmployedNoTaxBehind,
  createClaimWithUnemplymentDetailsOne,
  createClaimWithUnemplymentDetailsTwo,
  createClaimWithUnemploymentCategoryRETIRED,
  createClaimWithUnemploymentCategoryOTHER,
} from '../../../../utils/mockClaimForCheckAnswers';
import {Respondent} from '../../../../../main/common/models/respondent';
import {QualifiedStatementOfTruth} from '../../../../../main/common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {CounterpartyType} from '../../../../../main/common/models/counterpartyType';
import {Claim} from '../../../../../main/common/models/claim';

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
const expectedStatementOfTruth = {
  isFullAmountRejected: false,
  type: 'basic',
  directionsQuestionnaireSigned: '',
  signed: '',
};

const PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT = 'PAGES.CHECK_YOUR_ANSWER.BANK_TYPE_OF_ACCOUNT';
const PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE = 'PAGES.CHECK_YOUR_ANSWER.BANK_BALANCE';
const PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT = 'PAGES.CHECK_YOUR_ANSWER.BANK_JOINT_ACCOUNT';
const PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE = 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_TYPE';
const PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT = 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ARREARS_REPAYMENT';

const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_TYPE';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_NAME';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_JOB_TITLE';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_SELF_DETAILS';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_SELF_ANNUAL_TURNOVER';

const PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND = 'PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_ARE_YOU_BEHIND';

const PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_CLAIM_NUMBER = 'PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_CLAIM_NUMBER';
const PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_AMOUNT_OWNED = 'PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_AMOUNT_OWNED';
const PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_MONTHLY_INSTALMENT = 'PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_MONTHLY_INSTALMENT';

const PAGES_CHECK_YOUR_ANSWER_DEBT = 'PAGES.CHECK_YOUR_ANSWER.DEBT';
const PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED = 'PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED';
const PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS = 'PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS';

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
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      expect(summarySections.sections[1].summaryList.rows.length).toBe(5);
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
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, 'true'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.defendantStatementOfTruth = { isFullAmountRejected: false, type: SignatureType.BASIC, signed: 'true' };
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, 'true'))).toBeTruthy();
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

    it('should return bank accounts when it exists', async () => {
      //Given
      const claim = createClaimWithNoBankAccounts();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS');
      expect(summarySections.sections[1].summaryList.rows[0].value.html).toBe('None');
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
    });

    it('should return employemt details when it exists', async () => {
      //Given
      const claim = createClaimWithEmplymentDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DETAILS');
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_EMPLOYMENT_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DO_YOU_HAVE_A_JOB');
      expect(summarySections.sections[1].summaryList.rows[2].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Employed and Self-employed');

      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_WHO_EMPLOYS_YOU');
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_WHO_EMPLOYS_YOU_URL.replace(':id', CLAIM_ID));

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME);
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('Version 1');
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('FE Developer');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('Version 1');
      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('BE Developer');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
      expect(summarySections.sections[1].summaryList.rows[9].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', CLAIM_ID));

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('Developer');

      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£50,000');
    });

    it('should return employment with "Employed" category selected when it exists', async () => {
      //Given
      const claim = createClaimWithEmployedCategory();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Employed');
    });

    it('should return employment with "Self-Employed" category selected and tax payments behind when it exists', async () => {
      //Given
      const claim = createClaimWithSelfEmployedAndTaxBehind();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Self-employed');

      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', CLAIM_ID));

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('Developer');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£50,000');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND);

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_AMOUNT_YOU_OWE');
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£200');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_REASON');
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('Tax payment reasons');
    });

    it('should return employment with "Self-Employed" category selected and no tax payments behind when it exists', async () => {
      //Given
      const claim = createClaimWithSelfEmployedNoTaxBehind();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Self-employed');

      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', CLAIM_ID));

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('Developer');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£50,000');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('No');
    });

    it('should return unemployment details with signle year/month when it exists', async () => {
      //Given
      const claim = createClaimWithUnemplymentDetailsOne();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Unemployed for 1 year 1 month');

    });

    it('should return unemployment details with multiple years/months when it exists', async () => {
      //Given
      const claim = createClaimWithUnemplymentDetailsTwo();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Unemployed for 10 years 10 months');
    });

    it('should return unemployment details with unemployment category equal to "Retired" when it exists', async () => {
      //Given
      const claim = createClaimWithUnemploymentCategoryRETIRED();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Retired');
    });

    it('should return unemployment details with unemployment category equal to "Other" when it exists', async () => {
      //Given
      const claim = createClaimWithUnemploymentCategoryOTHER();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[3].value.html).toBe('Other details here');
    });

    it('should return court orders when it exists', async () => {
      //Given
      const claim = createClaimWithCourtOrders();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_CLAIM_NUMBER);
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe('1');
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_AMOUNT_OWNED);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£100');
      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_MONTHLY_INSTALMENT);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£1,500');

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_CLAIM_NUMBER);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('2');
      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_AMOUNT_OWNED);
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('£250');
      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_MONTHLY_INSTALMENT);
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£2,500');

    });

    it('should display "No" when court orders checkbox is set to no', async () => {
      //Given
      const claim = createClaimWithNoCourtOrders();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
      expect(summarySections.sections[1].summaryList.rows[4].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[4].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
    });

    it('should return priority debts when it exists', async () => {
      //Given
      const claim = createClaimWithPriorityDebts();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBTS_YOU_ARE_BEHIND_ON');
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MORTGAGE');
      expect(summarySections.sections[1].summaryList.rows[6].actions?.items[0].href).toBe(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[6].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_RENT');
      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('£2,000');

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe('3. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_COUNCIL_TAX');
      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£500.55');

      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe('4. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_GAS');
      expect(summarySections.sections[1].summaryList.rows[13].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[13].value.html).toBe('£300');

      expect(summarySections.sections[1].summaryList.rows[14].key.text).toBe('5. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[14].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ELECTRICITY');
      expect(summarySections.sections[1].summaryList.rows[15].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[15].value.html).toBe('£400');

      expect(summarySections.sections[1].summaryList.rows[16].key.text).toBe('6. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[16].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_WATER');
      expect(summarySections.sections[1].summaryList.rows[17].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[17].value.html).toBe('£500');

      expect(summarySections.sections[1].summaryList.rows[18].key.text).toBe('7. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[1].summaryList.rows[18].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MAINTENANCE');
      expect(summarySections.sections[1].summaryList.rows[19].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[1].summaryList.rows[19].value.html).toBe('£500');
    });

    it('should return loans or credit card debts when it exists', async () => {
      //Given
      const claim = createClaimWithDebts();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_LOANS_OR_CREDIT_CARDS');
      expect(summarySections.sections[1].summaryList.rows[5].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
      expect(summarySections.sections[1].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_DEBTS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[5].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBT);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('Loan 1');
      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£1,000');
      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£10');
    });

    it('should return multiple loans or credit card debts and show it with list number when it exists', async () => {
      //Given
      const claim = createClaimWithMultipleDebt();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_DEBT);
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('Loan 1');
      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED);
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£1,000');
      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS);
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£10');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_DEBT);
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('Loan 2');
      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBTS_TOTAL_OWED);
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£2,000');
      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_DEBTS_MONTHLY_PAYMENTS);
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£10');
    });

    it('should return monthly expenses when it exists', async () => {
      //Given
      const claim = createClaimWithRegularExpenses();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSES_REGULAR');
      expect(summarySections.sections[1].summaryList.rows[6].actions?.items[0].href).toBe(CITIZEN_MONTHLY_EXPENSES_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[6].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_RENT');
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£300');

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_COUNCIL_TAX');
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£10,000');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_GAS');
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('£100');

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_ELECTRICITY');
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£100');

      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_WATER');
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£400');

      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TRAVEL');
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe('£500');

      expect(summarySections.sections[1].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_SCHOOL_COSTS');
      expect(summarySections.sections[1].summaryList.rows[13].value.html).toBe('£600');

      expect(summarySections.sections[1].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_FOOD_AND_HOUSEKEEPING');
      expect(summarySections.sections[1].summaryList.rows[14].value.html).toBe('£700');

      expect(summarySections.sections[1].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_TV_BROADBAND');
      expect(summarySections.sections[1].summaryList.rows[15].value.html).toBe('£500.50');

      expect(summarySections.sections[1].summaryList.rows[16].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_HIRE_PURCHASE');
      expect(summarySections.sections[1].summaryList.rows[16].value.html).toBe('£44.40');

      expect(summarySections.sections[1].summaryList.rows[17].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MOBILE_PHONE');
      expect(summarySections.sections[1].summaryList.rows[17].value.html).toBe('£25');

      expect(summarySections.sections[1].summaryList.rows[18].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EXPENSE_MAINTENANCE');
      expect(summarySections.sections[1].summaryList.rows[18].value.html).toBe('£120');

      expect(summarySections.sections[1].summaryList.rows[19].key.text).toBe('Expenses 1');
      expect(summarySections.sections[1].summaryList.rows[19].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[20].key.text).toBe('Expenses 2');
      expect(summarySections.sections[1].summaryList.rows[20].value.html).toBe('£2,000');
    });

    it('should return monthly incomes when it exists', async () => {
      //Given
      const claim = createClaimWithRegularIncome();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_REGULAR');
      expect(summarySections.sections[1].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_MONTHLY_INCOME_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[5].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[1].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB');
      expect(summarySections.sections[1].summaryList.rows[6].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_UNIVERSAL_CREDIT');
      expect(summarySections.sections[1].summaryList.rows[7].value.html).toBe('£200');

      expect(summarySections.sections[1].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE');
      expect(summarySections.sections[1].summaryList.rows[8].value.html).toBe('£300');

      expect(summarySections.sections[1].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE_CONTRIBUTION');
      expect(summarySections.sections[1].summaryList.rows[9].value.html).toBe('£350.50');

      expect(summarySections.sections[1].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_SUPPORT');
      expect(summarySections.sections[1].summaryList.rows[10].value.html).toBe('£475.33');

      expect(summarySections.sections[1].summaryList.rows[11].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_WORKING_TAX_CREDIT');
      expect(summarySections.sections[1].summaryList.rows[11].value.html).toBe('£400.70');

      expect(summarySections.sections[1].summaryList.rows[12].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_TAX_CREDIT');
      expect(summarySections.sections[1].summaryList.rows[12].value.html).toBe('£550.50');

      expect(summarySections.sections[1].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_BENEFIT');
      expect(summarySections.sections[1].summaryList.rows[13].value.html).toBe('£600');

      expect(summarySections.sections[1].summaryList.rows[14].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_COUNCIL_TAX_SUPPORT');
      expect(summarySections.sections[1].summaryList.rows[14].value.html).toBe('£10');

      expect(summarySections.sections[1].summaryList.rows[15].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.INCOME_PENSION');
      expect(summarySections.sections[1].summaryList.rows[15].value.html).toBe('£247');

      expect(summarySections.sections[1].summaryList.rows[16].key.text).toBe('Income 1');
      expect(summarySections.sections[1].summaryList.rows[16].value.html).toBe('£1,000');

      expect(summarySections.sections[1].summaryList.rows[17].key.text).toBe('Income 2');
      expect(summarySections.sections[1].summaryList.rows[17].value.html).toBe('£2,000');
    });
  });

  describe('resetCheckboxFields', () => {
    it('should set directionsQuestionnaireSigned and signed to empty string for statement of truth', () => {
      const statementOfTruth = new StatementOfTruthForm(false);
      expect(resetCheckboxFields(statementOfTruth)).toEqual(expectedStatementOfTruth);
    });

    it('should set directionsQuestionnaireSigned and signed to empty string for qualified statement of truth', () => {
      const qualifiedStatementOfTruth = new QualifiedStatementOfTruth(false);
      const expectedQualifiedStatementOfTruth = {
        ...expectedStatementOfTruth,
        type: 'qualified',
      };
      expect(resetCheckboxFields(qualifiedStatementOfTruth)).toEqual(expectedQualifiedStatementOfTruth);
    });
  });

  describe('getStatementOfTruth', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return statement of truth if it is set in the draft store', () => {
      claim.defendantStatementOfTruth = new StatementOfTruthForm(false);
      expect(getStatementOfTruth(claim)).toEqual(expectedStatementOfTruth);
    });

    it('should create new statement of truth if signature type is basic', () => {
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'basic'});
    });

    it('should create new qualified statement of truth if signature type is qualified', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.ORGANISATION;
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'qualified'});
    });
  });

  describe('getSignatureType', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return basic signature type if respondent is individual', () => {
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is sole trader', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.SOLE_TRADER;
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is company', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.COMPANY;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });

    it('should return basic signature type if respondent is organisation', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.ORGANISATION;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });
  });
});
