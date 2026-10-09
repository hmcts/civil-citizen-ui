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
import {app} from '../../../../../../main/app-instance';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const redisStore = new Map<string, string>();
const mockDraftStoreClient = {
  get: jest.fn((key: string) => Promise.resolve(redisStore.get(key) ?? null)),
  set: jest.fn((key: string, value: string, ...options: unknown[]) => {
    if (options.includes('NX') && redisStore.has(key)) {
      return Promise.resolve(null);
    }
    redisStore.set(key, value);
    return Promise.resolve('OK');
  }),
  del: jest.fn((key: string) => Promise.resolve(Number(redisStore.delete(key)))),
};
app.locals.draftStoreClient = mockDraftStoreClient;

const mockReq = {
  ...req,
  session: {
    ...req.session,
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const draftCreatedAt = '2026-08-01T10:00:00.000Z';

const createMockManagerResult = (claim: Claim, createdAt = draftCreatedAt): DraftClaimManagerResult => ({
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

const createSubmittedClaim = (id = '1790322528949860'): Claim => {
  const submittedClaim = new Claim();
  submittedClaim.id = id;
  submittedClaim.legacyCaseReference = '000JE005';
  return submittedClaim;
};

beforeEach(() => {
  jest.clearAllMocks();
  redisStore.clear();
});

describe('Submit claim to ccd', () => {
  it('should submit claim successfully when there are no errors', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockUpdateDraftClaim.mockResolvedValue(undefined);

    const ccdTranslationServiceMock = jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');

    const submittedClaim = createSubmittedClaim();
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
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith(
      `submitted-claim:${mockReq.session.user.id}:draft-123:${draftCreatedAt}`,
      JSON.stringify({id: '1790322528949860', legacyCaseReference: '000JE005'}),
      'EX',
      30 * 86400,
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
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(createSubmittedClaim());

    await submitClaim(mockReq);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        applicant1: expect.objectContaining({
          emailAddress: new Email('email@email.com'),
        }),
        draftClaimCreatedAt: new Date(draftCreatedAt),
      }),
      'draft-123',
    );
  });

  it('should skip CCD create when draft already has a submitted case id', async () => {
    const linkedClaim = createSubmittedClaim();
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
    const submittedClaim = createSubmittedClaim();
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(submittedClaim);

    const result = await submitClaim(mockReq);

    expect(result).toBe(submittedClaim);
  });

  it('should not create a second CCD case when the draft reloads without an id after linking failed', async () => {
    mockGetDraftClaim.mockImplementation(() => Promise.resolve(createMockManagerResult(new Claim())));
    mockUpdateDraftClaim.mockRejectedValue(new Error('link draft to case failed'));
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    const submitSpy = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockResolvedValue(createSubmittedClaim());

    const first = await submitClaim(mockReq);
    const retryReq = {...req, session: {...req.session}} as unknown as AppRequest;
    const retry = await submitClaim(retryReq);

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(retry.id).toBe(first.id);
    expect(retry.legacyCaseReference).toBe('000JE005');
    expect(mockUpdateDraftClaim).toHaveBeenLastCalledWith(
      retryReq,
      expect.objectContaining({id: '1790322528949860', legacyCaseReference: '000JE005'}),
      'draft-123',
    );
  });

  it('should create a new CCD case for a different draft of the same user', async () => {
    mockUpdateDraftClaim.mockRejectedValue(new Error('link draft to case failed'));
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    const submitSpy = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockResolvedValueOnce(createSubmittedClaim('1790322528949860'))
      .mockResolvedValueOnce(createSubmittedClaim('1790322528949861'));

    mockGetDraftClaim.mockResolvedValueOnce(createMockManagerResult(new Claim()));
    await submitClaim(mockReq);
    mockGetDraftClaim.mockResolvedValueOnce(createMockManagerResult(new Claim(), '2026-09-15T10:00:00.000Z'));
    const result = await submitClaim(mockReq);

    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('1790322528949861');
  });

  it('should not submit to CCD when the submission cannot be reserved', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
    const submitSpy = jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim');

    await expect(submitClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should create only one CCD case when the same draft is submitted twice at the same time', async () => {
    mockGetDraftClaim.mockImplementation(() => Promise.resolve(createMockManagerResult(new Claim())));
    mockUpdateDraftClaim.mockResolvedValue(undefined);
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    const submitSpy = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(createSubmittedClaim()), 100)));

    const [first, second] = await Promise.all([submitClaim(mockReq), submitClaim(mockReq)]);

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(first.id).toBe('1790322528949860');
    expect(second.id).toBe('1790322528949860');
  });

  it('should allow a retry when CCD rejects the submission', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockUpdateDraftClaim.mockResolvedValue(undefined);
    jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCDR2');
    const submitSpy = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockRejectedValueOnce(new Error('CCD unavailable'))
      .mockResolvedValueOnce(createSubmittedClaim());

    await expect(submitClaim(mockReq)).rejects.toThrow('CCD unavailable');
    const result = await submitClaim(mockReq);

    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('1790322528949860');
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
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(createSubmittedClaim());

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
