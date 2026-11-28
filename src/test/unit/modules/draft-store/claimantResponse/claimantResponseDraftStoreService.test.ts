import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {ClaimantResponse} from 'models/claimantResponse';
import {DraftClaimResponse} from 'models/draft/draftClaim';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {isDraftClaimantResponseDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {getDraftClaimFromStore, readRedisCaseData, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  createOrLoadDraftResponseInDraftStoreDb,
  deleteDraftResponseFromDb,
  getDraftResponseForCaseFromDb,
  updateDraftResponseInDb,
} from 'modules/draft-store/claimantResponse/claimantResponseDraftStoreDbService';
import {deleteCachedDraft, getCachedDraft, setCachedDraft} from 'modules/draft-store/claimantResponse/claimantResponseDraftRedisCache';
import {
  deleteClaimantResponseDraft,
  getClaimantResponseDraft,
  readDurableClaimantResponse,
  saveClaimantResponseDraftIfApplicable,
  saveDurableClaimantResponse,
} from 'modules/draft-store/claimantResponse/claimantResponseDraftStoreService';

jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDraftClaimantResponseDatabaseEnabled: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  readRedisCaseData: jest.fn(),
  getDraftClaimFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
}));

jest.mock('modules/draft-store/claimantResponse/claimantResponseDraftStoreDbService', () => ({
  createOrLoadDraftResponseInDraftStoreDb: jest.fn(),
  deleteDraftResponseFromDb: jest.fn(),
  getDraftResponseForCaseFromDb: jest.fn(),
  updateDraftResponseInDb: jest.fn(),
}));

jest.mock('modules/draft-store/claimantResponse/claimantResponseDraftRedisCache', () => ({
  deleteCachedDraft: jest.fn(),
  getCachedDraft: jest.fn(),
  setCachedDraft: jest.fn(),
}));

const caseId = '1645882162449409';
const otherCaseId = '1645882162449410';
const userId = '11111111-1111-1111-1111-111111111111';

const requestFor = (id: string): AppRequest => ({
  params: {id},
  session: {user: {id: userId, accessToken: 'token'}},
} as unknown as AppRequest);

const draftFor = (id: string, forCase: string, progress = true): DraftClaimResponse => ({
  draftId: id,
  caseId: forCase,
  payload: {
    id: forCase,
    applicant1: {type: 'INDIVIDUAL'},
    ccdState: CaseState.AWAITING_APPLICANT_INTENTION,
    claimantResponse: progress ? {hasAgreed: true} : undefined,
  },
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
  expiresAt: '2026-12-02T00:00:00.000Z',
});

const claimantClaim = (): Claim => {
  const claim = new Claim();
  claim.id = caseId;
  claim.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.claimantResponse = {hasAgreed: true} as unknown as ClaimantResponse;
  return claim;
};

describe('claimantResponseDraftStoreService', () => {
  const getCachedDraftMock = getCachedDraft as jest.Mock;
  const setCachedDraftMock = setCachedDraft as jest.Mock;
  const deleteCachedDraftMock = deleteCachedDraft as jest.Mock;
  const getFromDbMock = getDraftResponseForCaseFromDb as jest.Mock;
  const createMock = createOrLoadDraftResponseInDraftStoreDb as jest.Mock;
  const updateMock = updateDraftResponseInDb as jest.Mock;
  const deleteFromDbMock = deleteDraftResponseFromDb as jest.Mock;
  const readRedisMock = readRedisCaseData as jest.Mock;
  const getJourneyMock = getDraftClaimFromStore as jest.Mock;
  const saveJourneyMock = saveDraftClaim as jest.Mock;
  const flagMock = isDraftClaimantResponseDatabaseEnabled as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    flagMock.mockResolvedValue(true);
  });

  it('loads the database draft on a cache miss and uses the cache on the next read', async () => {
    const stored = draftFor('draft-1', caseId);
    getCachedDraftMock.mockResolvedValueOnce(null).mockResolvedValueOnce(stored);
    getFromDbMock.mockResolvedValueOnce({rawResponse: stored});

    const first = await getClaimantResponseDraft(requestFor(caseId), caseId);
    const second = await getClaimantResponseDraft(requestFor(caseId), caseId);

    expect(first?.rawResponse.draftId).toBe('draft-1');
    expect(second?.rawResponse.draftId).toBe('draft-1');
    expect(getFromDbMock).toHaveBeenCalledTimes(1);
    expect(setCachedDraftMock).toHaveBeenCalledWith(userId, caseId, stored);
  });

  it('resumes from the database when the redis journey cache is empty', async () => {
    const stored = draftFor('draft-1', caseId);
    readRedisMock.mockResolvedValue(new Claim());
    getCachedDraftMock.mockResolvedValue(null);
    getFromDbMock.mockResolvedValue({rawResponse: stored});

    const claim = await readDurableClaimantResponse(requestFor(caseId), `${caseId}${userId}`);

    expect(claim?.claimantResponse).toEqual({hasAgreed: true});
    expect(setCachedDraftMock).toHaveBeenCalledWith(userId, caseId, stored);
  });

  it('does not return an expired or missing draft and strips in-progress claimant response', async () => {
    const redisClaim = claimantClaim();
    readRedisMock.mockResolvedValue(redisClaim);
    getCachedDraftMock.mockResolvedValue(null);
    getFromDbMock.mockResolvedValue(null);

    const claim = await readDurableClaimantResponse(requestFor(caseId), `${caseId}${userId}`);

    expect(claim).not.toBeNull();
    expect(claim?.claimantResponse).toBeUndefined();
  });

  it('leaves a non-claimant redis claim on redis', async () => {
    const redisClaim = new Claim();
    redisClaim.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
    redisClaim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    readRedisMock.mockResolvedValue(redisClaim);

    await expect(readDurableClaimantResponse(requestFor(caseId), `${caseId}${userId}`)).resolves.toBeNull();
    expect(getFromDbMock).not.toHaveBeenCalled();
  });

  it('keeps two cases for one user separate', async () => {
    getCachedDraftMock.mockResolvedValue(null);
    getFromDbMock.mockResolvedValue(null);
    createMock.mockImplementation(async (_req: AppRequest, claim: Claim) => ({
      isNew: true,
      rawResponse: draftFor(`draft-${claim.id}`, String(claim.id)),
    }));

    await saveDurableClaimantResponse(requestFor(caseId), caseId, claimantClaim());
    const other = claimantClaim();
    other.id = otherCaseId;
    await saveDurableClaimantResponse(requestFor(otherCaseId), otherCaseId, other);

    expect(createMock).toHaveBeenNthCalledWith(1, expect.anything(), expect.objectContaining({id: caseId}));
    expect(createMock).toHaveBeenNthCalledWith(2, expect.anything(), expect.objectContaining({id: otherCaseId}));
    expect(setCachedDraftMock).toHaveBeenCalledWith(userId, caseId, expect.objectContaining({caseId}));
    expect(setCachedDraftMock).toHaveBeenCalledWith(userId, otherCaseId, expect.objectContaining({caseId: otherCaseId}));
  });

  it('does not create a draft for a journey-cache write', async () => {
    const saved = await saveClaimantResponseDraftIfApplicable(
      requestFor(caseId),
      claimantClaim(),
      TTLCategory.JOURNEY_CACHE,
    );

    expect(saved).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('throws when the database read fails and still reads when the cache returns no draft', async () => {
    getCachedDraftMock.mockResolvedValue(null);
    getFromDbMock.mockRejectedValueOnce(new Error('db down'));

    await expect(getClaimantResponseDraft(requestFor(caseId), caseId)).rejects.toThrow('db down');

    const stored = draftFor('draft-1', caseId);
    getFromDbMock.mockResolvedValueOnce({rawResponse: stored});
    const recovered = await getClaimantResponseDraft(requestFor(caseId), caseId);

    expect(recovered?.rawResponse.draftId).toBe('draft-1');
  });

  it('deletes the database draft and the cache after a successful submit', async () => {
    getFromDbMock.mockResolvedValue({rawResponse: draftFor('draft-1', caseId)});
    getJourneyMock.mockResolvedValue({
      case_data: {
        applicant1: {type: 'INDIVIDUAL'},
        claimantResponse: {hasAgreed: true},
      },
    });

    await deleteClaimantResponseDraft(requestFor(caseId), caseId);

    expect(deleteFromDbMock).toHaveBeenCalledWith(expect.anything(), 'draft-1');
    expect(deleteCachedDraftMock).toHaveBeenCalledWith(userId, caseId);
    expect(saveJourneyMock).toHaveBeenCalledWith(
      `${caseId}${userId}`,
      expect.not.objectContaining({claimantResponse: {hasAgreed: true}}),
      true,
      userId,
      TTLCategory.JOURNEY_CACHE,
    );
  });

  it('treats a missing draft as a successful delete and still clears the cache', async () => {
    getFromDbMock.mockResolvedValue(null);
    getJourneyMock.mockResolvedValue(null);

    await deleteClaimantResponseDraft(requestFor(caseId), caseId);

    expect(deleteFromDbMock).not.toHaveBeenCalled();
    expect(deleteCachedDraftMock).toHaveBeenCalledWith(userId, caseId);
  });

  it('does nothing when the flag is off', async () => {
    flagMock.mockResolvedValue(false);

    await deleteClaimantResponseDraft(requestFor(caseId), caseId);

    expect(getFromDbMock).not.toHaveBeenCalled();
    expect(deleteCachedDraftMock).not.toHaveBeenCalled();
  });

  it('seeds the first draft from CCD when redis has no claimant response progress', async () => {
    const incoming = new Claim();
    incoming.claimantResponse = {hasAgreed: true} as unknown as ClaimantResponse;
    const ccdClaim = new Claim();
    ccdClaim.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
    ccdClaim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
    getCachedDraftMock.mockResolvedValue(null);
    getFromDbMock.mockResolvedValue(null);
    getJourneyMock.mockResolvedValue(null);
    createMock.mockImplementation(async (_req: AppRequest, claim: Claim) => ({
      isNew: true,
      rawResponse: draftFor(`draft-${claim.id}`, String(claim.id)),
    }));

    await saveDurableClaimantResponse(requestFor(caseId), caseId, incoming);

    expect(createMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      id: caseId,
      applicant1: ccdClaim.applicant1,
      claimantResponse: incoming.claimantResponse,
    }));
  });

  it('updates an existing draft instead of creating another', async () => {
    const existing = draftFor('draft-1', caseId);
    getCachedDraftMock.mockResolvedValue(existing);
    updateMock.mockResolvedValue({rawResponse: existing});

    await saveDurableClaimantResponse(requestFor(caseId), caseId, claimantClaim());

    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(expect.anything(), 'draft-1', expect.objectContaining({id: caseId}));
  });
});
