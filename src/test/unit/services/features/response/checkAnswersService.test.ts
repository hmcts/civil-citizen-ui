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
      expect(summarySections.sections[1].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PAYMENT_OPTION_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
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
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe(CONTACT_PERSON);
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

function createClaimWithBasicRespondentDetails(): Claim {
  const claim = {
    respondent1: {
      partyName: PARTY_NAME,
      telephoneNumber: CONTACT_NUMBER,
      dateOfBirth: new Date('2000-12-12'),
      responseType: ResponseType.FULL_ADMISSION,
      primaryAddress: {
        AddressLine1: '23 Brook lane',
        PostTown: 'Bristol',
        PostCode: 'BS13SS',
      },
    },
    paymentOption: PaymentOptionType.IMMEDIATELY,
  };
  return claim as Claim;
}

function createClaimWithIndividualDetails(): Claim {
  const claim = {
    respondent1: {
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
    },
  };
  return claim as Claim;
}

function createClaimWithContactPersonDetails(): Claim {
  const claim = {
    respondent1: {
      contactPerson: CONTACT_PERSON,
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
    },
  };
  return claim as Claim;
}
