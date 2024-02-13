import {
  getRejectAllOfClaim,
  saveRejectAllOfClaim,
} from '../../../../../main/services/features/response/rejectAllOfClaimService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {RejectAllOfClaim} from '../../../../../main/common/form/models/rejectAllOfClaim';
import {PartyType} from '../../../../../main/common/models/partyType';
import {RejectAllOfClaimType} from '../../../../../main/common/form/models/rejectAllOfClaimType';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('rejectAllOfClaim service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('get rejectAllOfClaim form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getRejectAllOfClaim('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeUndefined();
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const result = await getRejectAllOfClaim('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeTruthy();
      expect(result.option.length).toBe(11);
    });
  });

  describe('save rejectAllOfClaim data', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claim = createClaim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveRejectAllOfClaim('123', new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});

function createClaim() {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
  claim.applicant1 = {
    type: PartyType.ORGANISATION,
    partyDetails: {
      partyName: 'Test',
      title: 'Mr.',
      firstName: 'TestName',
      lastName: 'TestLastName',
    },
  };

  return claim;
}
