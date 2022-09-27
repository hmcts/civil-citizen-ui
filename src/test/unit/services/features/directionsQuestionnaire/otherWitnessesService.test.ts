import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {getOtherWitnesses, saveOtherWitnesses} from '../../../../../main/services/features/directionsQuestionnaire/otherWitnessesService';
import { Claim } from '../../../../../main/common/models/claim';
import { TestMessages } from '../../../../../test/utils/errorMessageTestConstants';
import {OtherWitnessItems} from '../../../../../main/common/models/directionsQuestionnaire/otherWitnesses/otherWitnessItems';
import {OtherWitnesses} from '../../../../../main/common/models/directionsQuestionnaire/otherWitnesses/otherWitnesses';
import { YesNo } from '../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

//const OTHER_WITNESS_ITEMS_EMPTY = new OtherWitnessItems(undefined);

const otherWitnessItems = new OtherWitnessItems(
  {
    'details': 'Details here...',
    'email': 'jane.clarke@version1.com',
    'firstName': 'Jane',
    'lastName': 'Clarke',
    'telephone': '01632960001',
  },
);

const otherWitnessItemsWithNoEmailAndTelephone = new OtherWitnessItems(
  {
    'details': 'Details here...',
    'email': '',
    'firstName': 'Jane',
    'lastName': 'Clarke',
    'telephone': '',
  },
);

describe('Other Witnesses Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  describe('getOtherWitnesses', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getOtherWitnesses('123');
      //Then
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toEqual(undefined);
    });

    it('should get empty form when other witnessess does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const otherWitnesses = new OtherWitnesses(undefined,[]);
        claim.directionQuestionnaire = {
          otherWitnesses: otherWitnesses,
        };
        return claim;
      });
      //When
      const form = await getOtherWitnesses('123');
      //Then
      expect(form.option).toEqual(undefined);
      expect(form.witnessItems).toEqual([]);
    });

    it('should return populated form when other witnessess exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const otherWitnesses = new OtherWitnesses(YesNo.YES,[otherWitnessItems]);
        claim.directionQuestionnaire = {
          otherWitnesses: otherWitnesses,
        };
        return claim;
      });
      //When
      const form = await getOtherWitnesses('123');

      //Then
      expect(form.option).toEqual(YesNo.YES);
      expect(form.witnessItems).toEqual([otherWitnessItems]);
    });

    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getOtherWitnesses('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveOtherWitnesses', () => {
    it('should save other witnesses data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const otherWitnesses = new OtherWitnesses(undefined,[]);
        claim.directionQuestionnaire = {
          otherWitnesses: otherWitnesses,
        };
        return claim;
      });

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveOtherWitnesses('123', new OtherWitnesses(YesNo.YES,[otherWitnessItems]));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save other witnesses data successfully without optional fields when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const otherWitnesses = new OtherWitnesses(undefined,[]);
        claim.directionQuestionnaire = {
          otherWitnesses: otherWitnesses,
        };
        return claim;
      });

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveOtherWitnesses('123', new OtherWitnesses(YesNo.YES,[otherWitnessItemsWithNoEmailAndTelephone]));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save other witnesses data successfully if option no and when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const otherWitnesses = new OtherWitnesses(undefined,[]);
        claim.directionQuestionnaire = {
          otherWitnesses: otherWitnesses,
        };
        return claim;
      });

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveOtherWitnesses('123', new OtherWitnesses(YesNo.NO,[]));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveOtherWitnesses('123', new OtherWitnesses(YesNo.YES,[otherWitnessItems]))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveOtherWitnesses('123', new OtherWitnesses(YesNo.YES,[otherWitnessItems]))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
