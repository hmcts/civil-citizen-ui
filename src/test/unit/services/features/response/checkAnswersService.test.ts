import {
  getSummarySections,
  saveStatementOfTruth,
} from '../../../../../main/services/features/response/checkAnswersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  DOB_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_PRIORITY_DEBTS_URL,
  CITIZEN_DEBTS_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../src/test/utils/errorMessageTestConstants';
import PaymentOptionType
  from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from '../../../../../main/common/models/signatureType';
import {
  TransactionSchedule,
} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CounterpartyType} from '../../../../../main/common/models/counterpartyType';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {DebtItems} from '../../../../../main/common/form/models/statementOfMeans/debts/debtItems';
import {Debts} from '../../../../../main/common/form/models/statementOfMeans/debts/debts';
import {PriorityDebts} from '../../../../../main/common/form/models/statementOfMeans/priorityDebts';
import {PriorityDebtDetails} from '../../../../../main/common/form/models/statementOfMeans/priorityDebtDetails';


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
    it('should return your response summary section', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[1].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PAYMENT_OPTION_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
    });

    it('should return your financial details section', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      expect(summarySections.sections[2].summaryList.rows.length).toBe(1);
      expect(summarySections.sections[2].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[2].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[2].title).toBe('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE');
    });

    it('should return response summary section with payment option type instalments', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[1].summaryList.rows.length).toBe(5);
      expect(summarySections.sections[1].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS');
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY');
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT');
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.EXPLANATION.TITLE');
    });
    it('should return response summary section with payment option by set date', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[1].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[1].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.EXPLANATION.TITLE');
      expect(summarySections.sections[1].summaryList.rows[0].value.html).toContain('COMMON.PAYMENT_OPTION.BY_SET_DATE: 25 June 2022');
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
      expect(summarySections.sections[2].summaryList.rows[1].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[1].value.html).toBe('Current account');
      expect(summarySections.sections[2].summaryList.rows[2].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[2].summaryList.rows[2].value.html).toBe('£1,000');
      expect(summarySections.sections[2].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[3].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

    });

    it('should return bank accounts when it exists', async () => {
      //Given
      const claim = createClaimWithStatementOfMeansDetails();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[2].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS');
      expect(summarySections.sections[2].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[2].summaryList.rows[0].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

      expect(summarySections.sections[2].summaryList.rows[1].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[1].value.html).toBe('Current account');
      expect(summarySections.sections[2].summaryList.rows[2].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[2].summaryList.rows[2].value.html).toBe('£1,000');
      expect(summarySections.sections[2].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[3].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

      expect(summarySections.sections[2].summaryList.rows[4].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[4].value.html).toBe('Saving account');
      expect(summarySections.sections[2].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[2].summaryList.rows[5].value.html).toBe('£2,000');
      expect(summarySections.sections[2].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[6].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));

      expect(summarySections.sections[2].summaryList.rows[7].key.text).toBe('3. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[7].value.html).toBe('ISA');
      expect(summarySections.sections[2].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[2].summaryList.rows[8].value.html).toBe('£2,000');
      expect(summarySections.sections[2].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[9].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));

      expect(summarySections.sections[2].summaryList.rows[10].key.text).toBe('4. ' + PAGES_CHECK_YOUR_ANSWER_BANK_TYPE_OF_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[10].value.html).toBe('Other');
      expect(summarySections.sections[2].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_BALANCE);
      expect(summarySections.sections[2].summaryList.rows[11].value.html).toBe('£2,000');
      expect(summarySections.sections[2].summaryList.rows[12].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_BANK_JOINT_ACCOUNT);
      expect(summarySections.sections[2].summaryList.rows[12].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));
    });

    it('should return priority debts when it exists', async () => {
      //Given
      const claim = createClaimWithStatementOfMeansDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[2].summaryList.rows[13].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBTS_YOU_ARE_BEHIND_ON');
      expect(summarySections.sections[2].summaryList.rows[14].key.text).toBe('1. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[14].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MORTGAGE');
      expect(summarySections.sections[2].summaryList.rows[14].actions?.items[0].href).toBe(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[2].summaryList.rows[14].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
      expect(summarySections.sections[2].summaryList.rows[15].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[15].value.html).toBe('£1,000');

      expect(summarySections.sections[2].summaryList.rows[16].key.text).toBe('2. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[16].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_RENT');
      expect(summarySections.sections[2].summaryList.rows[17].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[17].value.html).toBe('£2,000');

      expect(summarySections.sections[2].summaryList.rows[18].key.text).toBe('3. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[18].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_COUNCIL_TAX');
      expect(summarySections.sections[2].summaryList.rows[19].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[19].value.html).toBe('£500.55');

      expect(summarySections.sections[2].summaryList.rows[20].key.text).toBe('4. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[20].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_GAS');
      expect(summarySections.sections[2].summaryList.rows[21].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[21].value.html).toBe('£300');

      expect(summarySections.sections[2].summaryList.rows[22].key.text).toBe('5. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[22].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ELECTRICITY');
      expect(summarySections.sections[2].summaryList.rows[23].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[23].value.html).toBe('£400');

      expect(summarySections.sections[2].summaryList.rows[24].key.text).toBe('6. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[24].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_WATER');
      expect(summarySections.sections[2].summaryList.rows[25].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[25].value.html).toBe('£500');

      expect(summarySections.sections[2].summaryList.rows[26].key.text).toBe('7. ' + PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_TYPE);
      expect(summarySections.sections[2].summaryList.rows[26].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MAINTENANCE');
      expect(summarySections.sections[2].summaryList.rows[27].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_PRIORITY_DEBT_ARREARS_REPAYMENT);
      expect(summarySections.sections[2].summaryList.rows[27].value.html).toBe('£500');
    });

    it('should return loans or credit card debts when it exists', async () => {
      //Given
      const claim = createClaimWithStatementOfMeansDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[2].summaryList.rows[28].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_LOANS_OR_CREDIT_CARDS');
      expect(summarySections.sections[2].summaryList.rows[28].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
      expect(summarySections.sections[2].summaryList.rows[28].actions?.items[0].href).toBe(CITIZEN_DEBTS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[2].summaryList.rows[28].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
      expect(summarySections.sections[2].summaryList.rows[29].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBT');
      expect(summarySections.sections[2].summaryList.rows[29].value.html).toBe('Loan 1');
      expect(summarySections.sections[2].summaryList.rows[30].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED');
      expect(summarySections.sections[2].summaryList.rows[30].value.html).toBe('£1,000');
      expect(summarySections.sections[2].summaryList.rows[31].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS');
      expect(summarySections.sections[2].summaryList.rows[31].value.html).toBe('£10');
    });

    it('should return multiple loans or credit card debts and show it with list number when it exists', async () => {
      //Given
      const claim = createClaimWithMultipleDebt();

      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

      //Then
      expect(summarySections.sections[2].summaryList.rows[2].key.text).toBe('1. PAGES.CHECK_YOUR_ANSWER.DEBT');
      expect(summarySections.sections[2].summaryList.rows[2].value.html).toBe('Loan 1');
      expect(summarySections.sections[2].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED');
      expect(summarySections.sections[2].summaryList.rows[3].value.html).toBe('£1,000');
      expect(summarySections.sections[2].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS');
      expect(summarySections.sections[2].summaryList.rows[4].value.html).toBe('£10');

      expect(summarySections.sections[2].summaryList.rows[5].key.text).toBe('2. PAGES.CHECK_YOUR_ANSWER.DEBT');
      expect(summarySections.sections[2].summaryList.rows[5].value.html).toBe('Loan 2');
      expect(summarySections.sections[2].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED');
      expect(summarySections.sections[2].summaryList.rows[6].value.html).toBe('£2,000');
      expect(summarySections.sections[2].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS');
      expect(summarySections.sections[2].summaryList.rows[7].value.html).toBe('£10');
    });
  });
});

function createClaimWithBasicRespondentDetails(contactPerson?: string): Claim {
  const claim = new Claim();
  claim.respondent1 = {
    partyName: PARTY_NAME,
    telephoneNumber: CONTACT_NUMBER,
    contactPerson: contactPerson,
    dateOfBirth: new Date('2000-12-12'),
    responseType: ResponseType.FULL_ADMISSION,
    type: CounterpartyType.INDIVIDUAL,
    primaryAddress: {
      AddressLine1: '23 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
  };
  claim.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
}

function createClaimWithRespondentDetailsWithPaymentOption(paymentOption: PaymentOptionType): Claim {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = paymentOption;
  claim.repaymentPlan = {
    paymentAmount: 33,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date('2022-06-25'),
  };
  claim.paymentDate = new Date('2022-06-25');
  return claim;
}

function createClaimWithIndividualDetails(): Claim {
  const claim = new Claim();
  claim.respondent1 = {
    type: CounterpartyType.INDIVIDUAL,
    individualTitle: TITLE,
    individualLastName: LAST_NAME,
    individualFirstName: FIRST_NAME,
    partyName: PARTY_NAME,
    telephoneNumber: CONTACT_NUMBER,
    responseType: ResponseType.FULL_ADMISSION,
    primaryAddress: {
      AddressLine1: '23 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
    correspondenceAddress: {
      AddressLine1: '24 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
  };
  return claim;
}

function createClaimWithContactPersonDetails(): Claim {
  return createClaimWithBasicRespondentDetails(CONTACT_PERSON);
}

function createClaimWithOneBankAccount(): Claim {
  const claim = createClaimWithBasicRespondentDetails();
  claim.statementOfMeans = {
    'bankAccounts': [
      {
        'typeOfAccount': 'CURRENT_ACCOUNT',
        'joint': 'true',
        'balance': '1000',
      },
    ],
  };
  return claim as Claim;
}

function createClaimWithMultipleDebt(): Claim {
  const claim = createClaimWithBasicRespondentDetails();

  const debts: Debts = new Debts();
  debts.option = 'yes';
  debts.debtsItems = [
    new DebtItems('Loan 1', '1000', '10'),
    new DebtItems('Loan 2', '2000', '10'),
  ];

  claim.statementOfMeans = {
    debts: debts,
  };

  return claim as Claim;
}

function createClaimWithStatementOfMeansDetails(): Claim {
  const claim = new Claim();
  claim.respondent1 = {
    'individualTitle': 'Mr',
    'individualLastName': 'Richards',
    'individualFirstName': 'John',
    'partyName': 'Nice organisation',
    'telephoneNumber': '077777777779',
    'responseType': 'FULL_ADMISSION',
    'type': CounterpartyType.INDIVIDUAL,
    'primaryAddress': {
      'AddressLine1': '23 Brook lane',
      'PostTown': 'Bristol',
      'PostCode': 'BS13SS',
    },
    'correspondenceAddress': {
      'AddressLine1': '24 Brook lane',
      'PostTown': 'Bristol',
      'PostCode': 'BS13SS',
    },
  };

  claim.paymentOption = PaymentOptionType.IMMEDIATELY;

  claim.statementOfMeans = {
    'bankAccounts': [
      {
        'typeOfAccount': 'CURRENT_ACCOUNT',
        'joint': 'true',
        'balance': '1000',
      },
      {
        'typeOfAccount': 'SAVINGS_ACCOUNT',
        'joint': 'false',
        'balance': '2000',
      },
      {
        'typeOfAccount': 'ISA',
        'joint': 'false',
        'balance': '2000',
      },
      {
        'typeOfAccount': 'OTHER',
        'joint': 'false',
        'balance': '2000',
      },
    ],
  };

  const debts: Debts = new Debts();
  debts.option = 'yes';
  debts.debtsItems = [
    new DebtItems('Loan 1', '1000', '10'),
  ];

  claim.statementOfMeans.debts = debts;

  const mortgage: PriorityDebtDetails = new PriorityDebtDetails(true, 'Mortgage', 1000, 'WEEK');
  const rent: PriorityDebtDetails = new PriorityDebtDetails(true, 'Rent', 2000, 'FOUR_WEEKS');
  const councilTax: PriorityDebtDetails = new PriorityDebtDetails(true,'Council Tax or Community Charge',500.55,'FOUR_WEEKS');
  const gas: PriorityDebtDetails = new PriorityDebtDetails(true, 'Gas', 300, 'WEEK');
  const electricity: PriorityDebtDetails = new PriorityDebtDetails(true, 'Electricity', 400, 'TWO_WEEKS');
  const water: PriorityDebtDetails = new PriorityDebtDetails(true, 'Water', 500, 'MONTH');
  const maintenance: PriorityDebtDetails = new PriorityDebtDetails(true,'Maintenance Payments',500,'TWO_WEEKS');
  const priorityDebts: PriorityDebts = new PriorityDebts(mortgage,rent,councilTax,gas,electricity,water,maintenance);

  claim.statementOfMeans.priorityDebts = priorityDebts;

  return claim as Claim;
}
