import {
  getEmploymentForm,
  saveEmploymentData,
} from 'services/features/response/statementOfMeans/employment/employmentService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {YesNo} from 'form/models/yesNo';
import {GenericForm} from 'form/models/genericForm';
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

describe('employment service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmploymentForm', () => {
    it('should return an empty form when employment is not set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await getEmploymentForm(mockReq);

      expect(result.model.option).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated form when employment exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.employment = {
        declared: true,
        employmentType: [EmploymentCategory.EMPLOYED],
      };
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await getEmploymentForm(mockReq);

      expect(result.model.option).toBe(YesNo.YES);
      expect(result.model.employmentCategory).toEqual([EmploymentCategory.EMPLOYED]);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getEmploymentForm(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveEmploymentData', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveEmploymentData(mockReq, new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED]))))
        .rejects.toThrow('[employmentService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save employment data onto the response draft', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveEmploymentData(mockReq, new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED])));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            employment: expect.objectContaining({
              declared: true,
              employmentType: [EmploymentCategory.EMPLOYED],
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

      await expect(saveEmploymentData(mockReq, new GenericForm(new EmploymentForm(YesNo.NO))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
