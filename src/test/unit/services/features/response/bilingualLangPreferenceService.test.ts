import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getBilingualLangPreference, saveBilingualLangPreference} from 'services/features/response/bilingualLangPreferenceService';
import {Claim} from 'common/models/claim';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {GenericYesNo} from 'common/form/models/genericYesNo';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Bilingual Langiage Preference Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getBilingualLangPreference', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getBilingualLangPreference('123');
      //Then
      expect(form.option).toBeUndefined();
    });

    it('should get empty form when bilingual language preference does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimBilingualLanguagePreference = undefined;
        return claim;
      });
      //When
      const form = await getBilingualLangPreference('123');
      //Then
      expect(form.option).toEqual(undefined);
    });

    it('should return populated form when ENGLISH bilingual language preference exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
        return claim;
      });
      //When
      const form = await getBilingualLangPreference('123');

      //Then
      expect(form.option).toEqual(ClaimBilingualLanguagePreference.ENGLISH);
    });

    it('should return populated form when WELSH_AND_ENGLISH bilingual language preference exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
        return claim;
      });
      //When
      const form = await getBilingualLangPreference('123');

      //Then
      expect(form.option).toEqual(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);
    });

    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getBilingualLangPreference('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveBilingualLangPreference', () => {
    it('should save ENGLISH bilingual language preference data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveBilingualLangPreference('123', new GenericYesNo(
        ClaimBilingualLanguagePreference.ENGLISH,
        '',
      ));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save WELSH_AND_ENGLISH bilingual language preference data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveBilingualLangPreference('123', new GenericYesNo(
        ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH,
        '',
      ));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim for ENGLISH bilingual language preference', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveBilingualLangPreference('123', new GenericYesNo(
        ClaimBilingualLanguagePreference.ENGLISH,
        '',
      ))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on get claim WELSH_AND_ENGLISH bilingual language preference', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveBilingualLangPreference('123', new GenericYesNo(
        ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH,
        '',
      ))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
