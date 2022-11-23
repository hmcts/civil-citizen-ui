import {saveYourDefence} from 'services/features/response/yourDefenceService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {PartyType} from 'common/models/partyType';
import {Defence} from 'common/form/models/defence';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

describe('rejectAllOfClaim defence service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  describe('save rejectAllOfClaim defence', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveYourDefence(createClaim(), '123', new Defence('Test'));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save data successfully without rejectAllofClaim', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveYourDefence(new Claim(), '123', new Defence('Test'));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should Throw an error when save defence data', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      //When
      await saveYourDefence(new Claim(), '123', new Defence('Test'));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should fail when redis throws an error', async () => {
      // Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      // When
      mockSaveDraftClaim.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      // Then
      await expect(saveYourDefence(new Claim(), '123', new Defence('Test'))
        .catch(() => TestMessages.REDIS_FAILURE));
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
      individualTitle: 'Mr.',
      individualFirstName: 'TestName',
      individualLastName: 'TestLastName',
    },
  };
  claim.rejectAllOfClaim = new RejectAllOfClaim();

  return claim;
}
