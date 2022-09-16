import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {
  getExpertEvidence,
} from '../../../../../main/services/features/directionsQuestionnaire/defendantExpertEvidenceService';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Request defendantExpertEvidence to settle the Claim Service', () => {
  describe('getExpertEvidence', () => {
    it('should return defendantExpertEvidence object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const expertEvidence = await getExpertEvidence('validClaimId');
      expect(expertEvidence.option).toBeUndefined();
    });

    it('should return request defendantExpertEvidence option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantExpertEvidence = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const expertEvidence = await getExpertEvidence('validClaimId');
      expect(expertEvidence.option).toBe(YesNo.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(getExpertEvidence('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

});
