import checkAnswersService
  from '../../../../../main/services/features/response/checkAnswersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const PARTY_NAME = 'Mrs. Marry Richards';
const CONTACT_NUMBER = '077777777779';
const CLAIM_ID = 'claimId';

describe('Check Answers service', () => {
  describe('Get Summary Sections', () => {

    test('should return summary sections', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return createClaimWithBasicRespondentDetails();
      });
      //When
      const summarySections = await checkAnswersService.getSummarySections(CLAIM_ID);
      //Then
      expect(summarySections.sections.length).toBe(2);

      expect(summarySections.sections[0].title).toBe('Your details');
      expect(summarySections.sections[0].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('Full name');
      expect(summarySections.sections[0].summaryList.rows[0].value.text).toBe(PARTY_NAME);
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[0].actions?.items[0].text).toBe('Change');
      expect(summarySections.sections[0].summaryList.rows[1].key.text).toBe('Contact number (optional)');
      expect(summarySections.sections[0].summaryList.rows[1].value.text).toBe(CONTACT_NUMBER);
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PHONE_NUMBER_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[0].summaryList.rows[1].actions?.items[0].text).toBe('Change');

      expect(summarySections.sections[1].title).toBe('Your response to the claim');
      expect(summarySections.sections[1].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('Do you owe the money claimed');
      expect(summarySections.sections[1].summaryList.rows[0].value.text).toBe(ResponseType.FULL_ADMISSION);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[1].summaryList.rows[0].actions?.items[0].text).toBe('Change');
      expect(summarySections.sections[1].summaryList.rows[1].key.text).toBe('When will you pay');
      expect(summarySections.sections[1].summaryList.rows[1].value.text).toBe('Screen still to be developped');
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].href).toBe('#');
      expect(summarySections.sections[1].summaryList.rows[1].actions?.items[0].text).toBe('Change');
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
  };
  return claim as Claim;
}
