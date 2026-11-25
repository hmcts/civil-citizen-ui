import axios from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';
import {
  CIVIL_SERVICE_DRAFT_CLAIMANT_RESPONSE_RETENTION_DAYS,
  createOrLoadDraftResponseInDraftStoreDb,
  deleteDraftResponseFromDb,
  getDraftResponseForCaseFromDb,
  updateDraftResponseInDb,
} from 'modules/draft-store/claimantResponse/claimantResponseDraftStoreDbService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('claimantResponseDraftStoreDbService', () => {
  const caseId = '1645882162449409';
  const otherCaseId = '1645882162449410';
  const mockReq = {
    session: {user: {id: 'user-123', accessToken: 'token'}},
  } as unknown as AppRequest;

  const draft = (id: string, forCase: string): DraftClaimResponse => ({
    draftId: id,
    caseId: forCase,
    payload: {id: forCase, applicant1: {type: 'INDIVIDUAL'}},
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    expiresAt: '2026-12-02T00:00:00.000Z',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a 30 day retention on the payload', () => {
    expect(CIVIL_SERVICE_DRAFT_CLAIMANT_RESPONSE_RETENTION_DAYS).toBe(30);
  });

  it('returns null when the case draft is missing or expired', async () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.get.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

    await expect(getDraftResponseForCaseFromDb(mockReq, caseId)).resolves.toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/dashboard/draft-claimant-responses/case/${caseId}`),
      expect.objectContaining({
        headers: expect.objectContaining({Authorization: 'Bearer token'}),
      }),
    );
  });

  it('throws when the database get fails', async () => {
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedAxios.get.mockRejectedValueOnce(new Error('db down'));

    await expect(getDraftResponseForCaseFromDb(mockReq, caseId)).rejects.toThrow('db down');
  });

  it('creates separate drafts for two cases and stamps the 30 day ttl', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({status: 201, data: draft('draft-1', caseId)})
      .mockResolvedValueOnce({status: 201, data: draft('draft-2', otherCaseId)});

    const firstClaim = new Claim();
    firstClaim.id = caseId;
    const secondClaim = new Claim();
    secondClaim.id = otherCaseId;

    const first = await createOrLoadDraftResponseInDraftStoreDb(mockReq, firstClaim);
    const second = await createOrLoadDraftResponseInDraftStoreDb(mockReq, secondClaim);

    expect(first.rawResponse.draftId).toBe('draft-1');
    expect(second.rawResponse.draftId).toBe('draft-2');
    expect(firstClaim.draftClaimCacheTtlDays).toBe(30);
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/dashboard/draft-claimant-responses'),
      expect.objectContaining({caseId, payload: expect.objectContaining({draftClaimCacheTtlDays: 30})}),
      expect.any(Object),
    );
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/dashboard/draft-claimant-responses'),
      expect.objectContaining({caseId: otherCaseId}),
      expect.any(Object),
    );
  });

  it('reloads the existing draft when create returns 409', async () => {
    const claim = new Claim();
    claim.id = caseId;
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, response: {status: 409}});
    mockedAxios.get.mockResolvedValueOnce({status: 200, data: draft('draft-existing', caseId)});

    const result = await createOrLoadDraftResponseInDraftStoreDb(mockReq, claim);

    expect(result.isNew).toBe(false);
    expect(result.rawResponse.draftId).toBe('draft-existing');
  });

  it('updates the draft for the case', async () => {
    const claim = new Claim();
    claim.id = caseId;
    mockedAxios.put.mockResolvedValueOnce({status: 200, data: draft('draft-1', caseId)});

    const result = await updateDraftResponseInDb(mockReq, 'draft-1', claim);

    expect(result.rawResponse.caseId).toBe(caseId);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/draft-claimant-responses/draft-1'),
      expect.objectContaining({caseId, payload: expect.objectContaining({draftClaimCacheTtlDays: 30})}),
      expect.any(Object),
    );
  });

  it('treats a 404 on delete as success', async () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.delete.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

    await expect(deleteDraftResponseFromDb(mockReq, 'draft-1')).resolves.toBeUndefined();
  });

  it('throws when delete fails for another reason', async () => {
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedAxios.delete.mockRejectedValueOnce(new Error('db down'));

    await expect(deleteDraftResponseFromDb(mockReq, 'draft-1')).rejects.toThrow('db down');
  });
});
