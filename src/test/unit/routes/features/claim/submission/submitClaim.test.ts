import {submitClaim} from 'services/features/claim/submission/submitClaim';
import {AppRequest} from 'common/models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import * as ccdTranslationService from 'services/translation/claim/ccdTranslation';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {req} from '../../../../../utils/UserDetails';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {Party} from 'models/party';
import {Email} from 'models/Email';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  ...req,
  session: {
    ...req.session,
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

const claim = new Claim();
claim.claimFee = {
  calculatedAmountInPence: 1000,
  code: 'FEE202',
  version: 1,
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('Submit claim to ccd', () => {
  it('should submit claim successfully when there are no errors', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockUpdateDraftClaim.mockResolvedValue(undefined);

    const ccdTranslationServiceMock = jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');

    const submittedClaim = new Claim();
    submittedClaim.id = '1790322528949860';
    submittedClaim.legacyCaseReference = '000JE005';
    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockResolvedValue(submittedClaim);

    const result = await submitClaim(mockReq);

    expect(result).toBe(submittedClaim);
    expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        id: '1790322528949860',
        legacyCaseReference: '000JE005',
      }),
      'draft-123',
    );
    expect(ccdTranslationServiceMock).toHaveBeenCalled();
    expect(CivilServiceClientServiceMock).toHaveBeenCalled();
  });

  it('should set applicant email and createdAt then update the draft before submit', async () => {
    const claimWithApplicant = new Claim();
    claimWithApplicant.applicant1 = new Party();
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claimWithApplicant));
    mockUpdateDraftClaim.mockResolvedValue(undefined);
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    const submittedClaim = new Claim();
    submittedClaim.id = '1790322528949860';
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(submittedClaim);

    await submitClaim(mockReq);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        applicant1: expect.objectContaining({
          emailAddress: new Email('email@email.com'),
        }),
        draftClaimCreatedAt: new Date('2026-08-01T10:00:00.000Z'),
      }),
      'draft-123',
    );
  });

  it('should skip CCD create when draft already has a submitted case id', async () => {
    const linkedClaim = new Claim();
    linkedClaim.id = '1790322528949860';
    linkedClaim.legacyCaseReference = '000JE005';
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(linkedClaim));
    const submitSpy = jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim');

    const result = await submitClaim(mockReq);

    expect(result.id).toBe('1790322528949860');
    expect(result.legacyCaseReference).toBe('000JE005');
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should still return submitted claim when persisting case id to draft fails', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockUpdateDraftClaim.mockRejectedValueOnce(new Error('draft update failed'));
    const submittedClaim = new Claim();
    submittedClaim.id = '1790322528949860';
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(submittedClaim);

    const result = await submitClaim(mockReq);

    expect(result).toBe(submittedClaim);
  });

  it('should use rawResponse draftId when session has none', async () => {
    const reqWithoutDraftId = {
      ...req,
      session: {
        ...req.session,
      },
    } as unknown as AppRequest;
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockUpdateDraftClaim.mockResolvedValue(undefined);
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    const submittedClaim = new Claim();
    submittedClaim.id = '1790322528949860';
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(submittedClaim);

    await submitClaim(reqWithoutDraftId);

    expect(mockGetDraftClaim).toHaveBeenCalled();
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      reqWithoutDraftId,
      expect.objectContaining({id: '1790322528949860'}),
      'draft-123',
    );
  });

  it('should throw when no draft exists', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(submitClaim(mockReq)).rejects.toThrow('[submitClaim] no draft claim found');
  });

  it('should throw an error', async () => {
    mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await expect(submitClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
