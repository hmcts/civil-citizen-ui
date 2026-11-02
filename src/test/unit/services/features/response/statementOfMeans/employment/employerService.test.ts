import {getEmployers, saveEmployers} from 'services/features/response/statementOfMeans/employment/employerService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Employer} from 'form/models/statementOfMeans/employment/employer';
import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

describe('employer service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmployers', () => {
    it('should return a blank employer row when none are set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await getEmployers(mockReq);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].employerName).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated employers when data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.employers = new Employers([new Employer('Acme', 'Dev')]);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await getEmployers(mockReq);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].employerName).toBe('Acme');
      expect(result.rows[0].jobTitle).toBe('Dev');
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getEmployers(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveEmployers', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveEmployers(mockReq, new Employers([new Employer('Acme', 'Dev')])))
        .rejects.toThrow('[employerService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save filtered employers onto the response draft', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveEmployers(mockReq, new Employers([
        new Employer('Acme', 'Dev'),
        new Employer('', ''),
      ]));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            employers: expect.objectContaining({
              rows: [expect.objectContaining({employerName: 'Acme', jobTitle: 'Dev'})],
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveEmployers(mockReq, new Employers([new Employer('Acme', 'Dev')])))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
