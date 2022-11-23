import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {buildAddress, mockClaim} from '../../../../../utils/mockClaim';
import {Party} from 'common/models/party';
import {
  getDefendantInformation,
  saveDefendantProperty,
} from '../services/features/common/defendantDetailsService';
import {PartyType} from 'common/models/partyType';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const CLAIM_ID = '123';

describe('Defendant details service', () => {
  describe('getDefendantInformation', () => {
    it('should return a empty object when no data retrieved', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return {};
      });

      const result: Party = await getDefendantInformation(CLAIM_ID);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual({});
    });

    it('should return a defendant object with values when data is retrieved', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });

      const result: Party = await getDefendantInformation(CLAIM_ID);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockClaim.respondent1);
    });
  });

  describe('saveDefendant', () => {
    it('should save a defendant when has no information on redis ', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const expectedData = new Claim();
      expectedData.respondent1 = {type: PartyType.INDIVIDUAL};

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      await saveDefendantProperty(CLAIM_ID, 'type', PartyType.INDIVIDUAL);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, expectedData);
    });

    it('should update defendant when in redis', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseData.mockImplementation(async () => {
        const claim = mockClaim;
        claim.respondent1 = new Party();
        claim.respondent1 = {
          partyDetails: {
            primaryAddress: buildAddress(),
          },
          responseType: 'foo',
          type: PartyType.INDIVIDUAL,
        };
        return claim;
      });

      await saveDefendantProperty(CLAIM_ID, 'type', PartyType.ORGANISATION);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });
});
