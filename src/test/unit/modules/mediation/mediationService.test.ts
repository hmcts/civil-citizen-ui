import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../main/common/models/claim';
import {YesNo} from '../../../../main/common/form/models/yesNo';
import {getMediation, saveMediation} from '../../../../main/modules/mediation/mediationService';
import {Mediation} from '../../../../main/common/models/mediation';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

jest.mock('../../../../main/modules/draft-store/draftStoreService');

const claimId = '123';
const telephoneNumber = '6000000';
const mediationExample = {
  individualTelephone: { option: YesNo.YES, telephoneNumber: telephoneNumber },
  mediationDisagreement: { option: YesNo.YES },
};

describe('Mediation service', () => {
  describe('get mediation form model', () => {
    it('should return an empty mediation model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getMediation(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).toEqual(new Mediation());
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const mediation = await getMediation(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(mediation).not.toBeNull();
      expect(mediation.individualTelephone?.telephoneNumber).toBe(telephoneNumber);
      expect(mediation.individualTelephone?.option).toBeTruthy();
      expect(mediation.mediationDisagreement?.option).toBeTruthy();
    });
    it('should rethrow error when error occurs', async () => {
      //When
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getMediation(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save mediation data', () => {
    it('should save data successfully when mediation exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claim = createClaim();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveMediation(claimId, { option: YesNo.NO }, 'mediationDisagreement');
      //Then
      expect(spySave).toBeCalled();
      const mediation = await getMediation(claimId);
      expect(mediation.mediationDisagreement?.option).toBe(YesNo.NO);
    });
    it('should save data successfully when mediation doesn´t exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await saveMediation(claimId, { option: YesNo.NO }, 'mediationDisagreement');
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs', async () => {
      //When
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveMediation(claimId, { option: YesNo.NO }, 'mediationDisagreement')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim() {
  const claim = new Claim();
  claim.mediation = createMediation();
  return claim;
}

function createMediation() {
  return new Mediation(
    mediationExample.individualTelephone,
    mediationExample.mediationDisagreement,
  );
}

