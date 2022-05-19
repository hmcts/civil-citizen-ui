import {getSummarySections} from '../../../../../main/services/features/response/checkAnswersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../src/test/utils/errorMessageTestConstants';
import PaymentOptionType
  from '../../../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';


jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));


const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const PARTY_NAME = 'Nice organisation';
const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const FULL_NAME = `${TITLE} ${FIRST_NAME} ${LAST_NAME}`;
const CONTACT_NUMBER = '077777777779';
const CLAIM_ID = 'claimId';

describe('Check Answers service', () => {
  describe('Get Summary Sections', () => {
    beforeEach(async () => {
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return createClaimWithBasicRespondentDetails();
      });
    });
    it('should return your details summary sections', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, 'cimode');
      //Then
      expect(summarySections.sections.length).toBe(2);
      expect(summarySections.sections[0].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[0].summaryList.rows[0].value.text).toBe(PARTY_NAME);
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[1].value.text).toBe(CONTACT_NUMBER);
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PHONE_NUMBER_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].title).toBe('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE');
      expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
      expect(summarySections.sections[0].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER');
    });
    it('should return your response summary section', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, 'cimode');
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
        getSummarySections(CLAIM_ID)).rejects.toThrow(TestMessages.REDIS_FAILURE);

    });
    it('should return full name of a person when full name is present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return createClaimWithIndividualDetails();
      });
      //When
      const summarySections = await getSummarySections(CLAIM_ID, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[0].value.text).toBe(FULL_NAME);
    });
  });
});

function createClaimWithBasicRespondentDetails(): Claim {
  const claim = {
    respondent1: {
      partyName: PARTY_NAME,
      telephoneNumber: CONTACT_NUMBER,
      responseType: ResponseType.FULL_ADMISSION,
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
    },
  };
  return claim as Claim;

}
