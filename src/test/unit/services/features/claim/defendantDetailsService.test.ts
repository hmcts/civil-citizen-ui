import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim, Party} from '../../../../../main/common/models/claim';
import {buildPrimaryAddress, mockClaim} from '../../../../utils/mockClaim';
import {Respondent} from '../../../../../main/common/models/respondent';
import {
  getDefendantInformation,
  saveDefendant,
} from '../../../../../main/services/features/claim/defendantDetailsService';
import {PartyType} from '../../../../../main/common/models/partyType';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

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
      expectedData.respondent1 =  {type: PartyType.INDIVIDUAL};

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      await saveDefendant(CLAIM_ID, 'type', PartyType.INDIVIDUAL);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, expectedData);
    });

    it('should save a defendant type when is undefined in redis', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });

      await saveDefendant(CLAIM_ID, 'type', PartyType.INDIVIDUAL);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    it('should update defendant when in redis', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseData.mockImplementation(async () => {
        const claim = mockClaim;
        claim.respondent1 = new Respondent();
        claim.respondent1 = {
          primaryAddress: buildPrimaryAddress(),
          responseType: 'foo',
          type: PartyType.INDIVIDUAL,
        };
        return claim;
      });

      await saveDefendant(CLAIM_ID, 'type', PartyType.ORGANISATION);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });
});
