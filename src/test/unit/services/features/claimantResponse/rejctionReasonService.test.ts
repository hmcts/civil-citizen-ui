import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {getRejectionReason, saveRejectionReason} from 'main/services/features/claimantResponse/rejectionReasonService';
import {ClaimantResponse} from '../../../../../main/common/models/claimantResponse';
import {RejectionReason} from '../../../../../main/common/form/models/claimantResponse/rejectionReason';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Claimant Rejection Reason service', () => {
  describe('get rejection reason form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getRejectionReason('claimId');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).toEqual(new RejectionReason());
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      const newClaim = new Claim();
      const response = new ClaimantResponse();
      const rejectionReason = new RejectionReason('not agree');
      response.rejectionReason = rejectionReason;
      newClaim.claimantResponse = response;

      mockGetCaseData.mockImplementation(async () => {
        return newClaim;
      });
      //When
      const result = await getRejectionReason('claimId');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.text).toContain('not agree');
    });
  });

  describe('save rejection reason.', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveRejectionReason('claimId', new RejectionReason('not agree'));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});
