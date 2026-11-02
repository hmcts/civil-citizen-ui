import {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
} from 'services/features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {SelfEmployedAsForm} from 'form/models/statementOfMeans/employment/selfEmployed/selfEmployedAsForm';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const JOB_TITLE = 'Developer';
const ANNUAL_TURNOVER = 70000.22;
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

describe('Self Employed Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSelfEmployedAsForm', () => {
    it('should return an empty form when no data exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getSelfEmployedAsForm(mockReq);

      expect(form.model.jobTitle).toBeUndefined();
      expect(form.model.annualTurnover).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return an empty form when selfEmployedAs does not exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getSelfEmployedAsForm(mockReq);

      expect(form.model.jobTitle).toBeUndefined();
      expect(form.model.annualTurnover).toBeUndefined();
    });

    it('should return populated form when selfEmployedAs exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.selfEmployedAs = new SelfEmployedAsForm(JOB_TITLE, ANNUAL_TURNOVER);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getSelfEmployedAsForm(mockReq);

      expect(form.model.jobTitle).toBe(JOB_TITLE);
      expect(form.model.annualTurnover).toBe(ANNUAL_TURNOVER);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getSelfEmployedAsForm(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveSelfEmployedAsData', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveSelfEmployedAsData(mockReq, new GenericForm(new SelfEmployedAsForm(JOB_TITLE, ANNUAL_TURNOVER))))
        .rejects.toThrow('[selfEmployedAsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveSelfEmployedAsData(mockReq, new GenericForm(new SelfEmployedAsForm(JOB_TITLE, ANNUAL_TURNOVER)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            selfEmployedAs: expect.objectContaining({
              jobTitle: JOB_TITLE,
              annualTurnover: ANNUAL_TURNOVER,
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when statement of means already exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveSelfEmployedAsData(mockReq, new GenericForm(new SelfEmployedAsForm(JOB_TITLE, ANNUAL_TURNOVER)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            selfEmployedAs: expect.objectContaining({
              jobTitle: JOB_TITLE,
              annualTurnover: ANNUAL_TURNOVER,
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveSelfEmployedAsData(mockReq, new GenericForm(new SelfEmployedAsForm(JOB_TITLE, ANNUAL_TURNOVER))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
