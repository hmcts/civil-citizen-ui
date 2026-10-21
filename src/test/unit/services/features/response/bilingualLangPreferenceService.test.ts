import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {AppRequest} from 'models/AppRequest';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {
  getBilingualLangPreference,
  saveBilingualLangPreference,
  saveClaimantBilingualLangPreference, getCookieLanguage,
} from 'services/features/response/bilingualLangPreferenceService';
import {Claim} from 'common/models/claim';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {GenericYesNo} from 'common/form/models/genericYesNo';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

describe('Bilingual Langiage Preference Service', () => {
  const mockGetDraftClaim = getDraftClaim as jest.Mock;
  const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
  const mockGetResponseDraft = getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;
  const mockReq = {
    params: {id: '123'},
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
    it('should get empty form when draft has no case data preference', () => {
      const form = getBilingualLangPreference(createMockManagerResult(new Claim()));
      expect(form.option).toBeUndefined();
    });

    it('should get empty form when bilingual language preference does not exist', () => {
      const claim = new Claim();
      claim.claimBilingualLanguagePreference = undefined;
      const form = getBilingualLangPreference(createMockManagerResult(claim));
      expect(form.option).toEqual(undefined);
    });

    it('should return populated form when ENGLISH bilingual language preference exists', () => {
      const claim = new Claim();
      claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
      const form = getBilingualLangPreference(createMockManagerResult(claim));
      expect(form.option).toEqual(ClaimBilingualLanguagePreference.ENGLISH);
    });

    it('should return populated form when WELSH_AND_ENGLISH bilingual language preference exists', () => {
      const claim = new Claim();
      claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const form = getBilingualLangPreference(createMockManagerResult(claim));
      expect(form.option).toEqual(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);
    });
  });

  describe('saveBilingualLangPreference', () => {
    const form = (option: ClaimBilingualLanguagePreference) => new GenericYesNo(option, '');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save ENGLISH bilingual language preference onto the response draft', async () => {
      mockGetResponseDraft.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH));

      expect(mockGetResponseDraft).toHaveBeenCalledWith(mockReq, '123');
      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        '123',
        expect.objectContaining({
          claimBilingualLanguagePreference: ClaimBilingualLanguagePreference.ENGLISH,
        }),
        'draft-123',
      );
    });

    it('should save WELSH_AND_ENGLISH bilingual language preference onto the response draft', async () => {
      mockGetResponseDraft.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        '123',
        expect.objectContaining({
          claimBilingualLanguagePreference: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH,
        }),
        'draft-123',
      );
    });

    it('should save WELSH language preference onto the response draft', async () => {
      mockGetResponseDraft.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.WELSH));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        '123',
        expect.objectContaining({
          claimBilingualLanguagePreference: ClaimBilingualLanguagePreference.WELSH,
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft exists', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH)))
        .rejects.toThrow('[bilingualLangPreferenceService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should rethrow error when getResponseDraft fails', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveBilingualLangPreference(mockReq, form(ClaimBilingualLanguagePreference.ENGLISH)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
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
