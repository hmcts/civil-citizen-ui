import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'models/AppRequest';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import * as utilityService from 'modules/utilityService';
import {
  getBilingualLangPreference,
  saveBilingualLangPreference,
  saveClaimantBilingualLangPreference, getCookieLanguage,
} from 'services/features/response/bilingualLangPreferenceService';
import {Claim} from 'common/models/claim';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import express from 'express';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../main/modules/utilityService');

describe('Bilingual Langiage Preference Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGetDraftClaim = getDraftClaim as jest.Mock;
  const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
  const mockGetClaimById = utilityService.getClaimById as jest.Mock;
  const req = {params: {id: '123'}} as unknown as express.Request;
  const mockReq = {
    session: {
      user: {id: '123'},
      draftId: 'draft-123',
    },
  } as unknown as AppRequest;

  const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
    claimResponse: {
      id: '123',
      case_data: claim,
    } as unknown as CivilClaimResponse,
    rawResponse: {
      draftId: 'draft-123',
      payload: claim,
    } as unknown as DraftClaimManagerResult['rawResponse'],
    createdAt,
    updatedAt: '2026-08-01T11:00:00.000Z',
    expiresAt: '2026-09-01T10:00:00.000Z',
  });

  describe('getBilingualLangPreference', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetClaimById.mockImplementation(async () => {
        return {};
      });
      //When
      const form = await getBilingualLangPreference(req);
      //Then
      expect(form.option).toBeUndefined();
    });

    it('should get empty form when bilingual language preference does not exist', async () => {
      //Given
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimBilingualLanguagePreference = undefined;
        return claim;
      });
      //When
      const form = await getBilingualLangPreference(req);
      //Then
      expect(form.option).toEqual(undefined);
    });

    it('should return populated form when ENGLISH bilingual language preference exists', async () => {
      //Given
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
        return claim;
      });
      //When
      const form = await getBilingualLangPreference(req);

      //Then
      expect(form.option).toEqual(ClaimBilingualLanguagePreference.ENGLISH);
    });

    it('should return populated form when WELSH_AND_ENGLISH bilingual language preference exists', async () => {
      //Given
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
        return claim;
      });
      //When
      const form = await getBilingualLangPreference(req);
      //Then
      expect(form.option).toEqual(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);
    });

    it('should rethrow error when error occurs', async () => {
      //Given
      mockGetClaimById.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //When-Then
      await expect(getBilingualLangPreference(req)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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

    it('should save WELSH language preference data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveBilingualLangPreference('123', new GenericYesNo(
        ClaimBilingualLanguagePreference.WELSH,
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

  describe('saveBilingualLangPreference for claim creation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const form = (option: ClaimBilingualLanguagePreference) => new GenericYesNo(option, '');

    it('should save ENGLISH bilingual language preference data successfully when claim exists', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH));

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimantBilingualLanguagePreference: ClaimBilingualLanguagePreference.ENGLISH,
        }),
        'draft-123',
      );
    });

    it('should save WELSH_AND_ENGLISH bilingual language preference data successfully when claim exists', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimantBilingualLanguagePreference: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH,
        }),
        'draft-123',
      );
    });

    it('should save WELSH language preference data successfully when claim exists', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.WELSH));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimantBilingualLanguagePreference: ClaimBilingualLanguagePreference.WELSH,
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'draft-123',
      );
    });

    it('should save undefined preference when option is unknown', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantBilingualLangPreference(mockReq, form('unknown' as ClaimBilingualLanguagePreference));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimantBilingualLanguagePreference: undefined,
        }),
        'draft-123',
      );
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveClaimantBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH)))
        .rejects.toThrow('[bilingualLangPreferenceService] no draft claim found');
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should rethrow error when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveClaimantBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('setCookieLanguage for claim', () =>{
    it('should set the cookies lang field to en when Lang selected is ENGLISH', async () => {
      //When
      const lang = getCookieLanguage(false, ClaimBilingualLanguagePreference.ENGLISH);
      //Then
      expect(lang).toEqual('en');
    });

    it('should set the cookies lang field to en when Lang selected is WELSH', async () => {
      //When
      const lang = getCookieLanguage(true, ClaimBilingualLanguagePreference.WELSH);
      //Then
      expect(lang).toEqual('cy');
    });

    it('should set the cookies lang field to cy when Lang selected is Bilingual and toggle is off', async () => {
      //When
      const lang = getCookieLanguage(false, ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);
      //Then
      expect(lang).toEqual('cy');
    });

    it('should default cookie language to en when option is unknown', () => {
      expect(getCookieLanguage(false, 'unknown')).toEqual('en');
    });

    it('should set the cookies lang field to en when Lang selected is Bilingual and toggle is On', async () => {
      const lang = getCookieLanguage(true, ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);
      expect(lang).toEqual('en');
    });
  });
});
