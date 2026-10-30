import {
  getForm,
  saveFormToDraftStore,
} from 'services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {BetweenSixteenAndNineteenDependants} from 'form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
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

function createClaim(between1819: number, numberOfChildrenLivingWithYou: number | undefined) {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.dependants = new Dependants(true, new NumberOfChildren(undefined, undefined, between1819));
  statementOfMeans.numberOfChildrenLivingWithYou = numberOfChildrenLivingWithYou;
  claim.statementOfMeans = statementOfMeans;
  return claim;
}

describe('dependent teenagers service test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getForm', () => {
    it('should get empty form when no data exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getForm(mockReq);

      expect(form.model.value).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should get form with maxValue set from data when data from previous page exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim(4, undefined));

      const form = await getForm(mockReq);

      expect(form.model.value).toBeUndefined();
      expect(form.model.maxValue).toBe(4);
    });

    it('should get form with maxValue and value set from data when data exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim(4, 3));

      const form = await getForm(mockReq);

      expect(form.model.value).toBe(3);
      expect(form.model.maxValue).toBe(4);
    });

    it('should rethrow error when error occurs', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getForm(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveFormToDraftStore', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveFormToDraftStore(mockReq, new GenericForm(new BetweenSixteenAndNineteenDependants(3, 4))))
        .rejects.toThrow('[betweenSixteenAndNineteenService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save data successfully', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      const claim = await saveFormToDraftStore(mockReq, new GenericForm(new BetweenSixteenAndNineteenDependants(3, 4)));

      expect(claim.statementOfMeans?.numberOfChildrenLivingWithYou).toBe(3);
      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            numberOfChildrenLivingWithYou: 3,
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when statement of means already exists', async () => {
      const existingClaim = new Claim();
      existingClaim.statementOfMeans = new StatementOfMeans();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(existingClaim));
      mockUpdateResponseDraft.mockResolvedValue({});

      const claim = await saveFormToDraftStore(mockReq, new GenericForm(new BetweenSixteenAndNineteenDependants(2, 4)));

      expect(claim.statementOfMeans?.numberOfChildrenLivingWithYou).toBe(2);
    });

    it('should throw error when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveFormToDraftStore(mockReq, new GenericForm(new BetweenSixteenAndNineteenDependants(3, 4))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
