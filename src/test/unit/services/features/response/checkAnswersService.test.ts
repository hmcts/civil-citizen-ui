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
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../src/test/utils/errorMessageTestConstants';
import PaymentOptionType
  from '../../../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from '../../../../../main/common/models/signatureType';
import {
  TransactionSchedule,
} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CounterpartyType} from '../../../../../main/common/models/counterpartyType';


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

describe('Check Answers service', () => {
  describe('Get Summary Sections', () => {
    const claim = createClaimWithBasicRespondentDetails();
    it('should return your details summary sections', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections.length).toBe(2);
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
    it('should return response summary section with payment option type instalments', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[1].summaryList.rows.length).toBe(6);
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS');
      expect(summarySections.sections[1].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY');
      expect(summarySections.sections[1].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT');
      expect(summarySections.sections[1].summaryList.rows[5].key.text).toBe('PAGES.EXPLANATION.TITLE');
    });
    it('should return response summary section with payment option by set date', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[1].summaryList.rows.length).toBe(3);
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[1].summaryList.rows[2].key.text).toBe('PAGES.EXPLANATION.TITLE');
      expect(summarySections.sections[1].summaryList.rows[1].value.html).toContain('COMMON.PAYMENT_OPTION.BY_SET_DATE: 25 June 2022');
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
