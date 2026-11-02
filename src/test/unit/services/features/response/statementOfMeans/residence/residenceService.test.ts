import {
  getResidence,
  getResidenceForm,
  saveResidence,
} from 'services/features/response/statementOfMeans/residence/residenceService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Residence} from 'form/models/statementOfMeans/residence/residence';
import {ResidenceType} from 'form/models/statementOfMeans/residence/residenceType';
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

describe('Residence service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResidence', () => {
    it('should return an empty residence when none is set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await getResidence(mockReq);

      expect(result).toEqual(new Residence());
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated residence when data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.residence = new Residence(ResidenceType.OWN_HOME, '');
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await getResidence(mockReq);

      expect(result.type).toEqual(ResidenceType.OWN_HOME);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getResidence(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveResidence', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveResidence(mockReq, new Residence(ResidenceType.JOINT_OWN_HOME, '')))
        .rejects.toThrow('[residenceService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveResidence(mockReq, new Residence(ResidenceType.JOINT_OWN_HOME, ''));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            residence: expect.objectContaining({type: ResidenceType.JOINT_OWN_HOME}),
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

      await saveResidence(mockReq, new Residence(ResidenceType.OWN_HOME, ''));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            residence: expect.objectContaining({type: ResidenceType.OWN_HOME}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveResidence(mockReq, new Residence(ResidenceType.OWN_HOME, '')))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getResidenceForm', () => {
    it('should get residence form successfully', () => {
      const result = getResidenceForm(ResidenceType.JOINT_OWN_HOME, '');
      expect(result).toEqual(new Residence(ResidenceType.JOINT_OWN_HOME, ''));
    });

    it('should keep housing details when type is other', () => {
      const result = getResidenceForm(ResidenceType.OTHER, 'details');
      expect(result).toEqual(new Residence(ResidenceType.OTHER, 'details'));
    });

    it('should clear housing details when type is not other', () => {
      const result = getResidenceForm(ResidenceType.JOINT_OWN_HOME, 'details');
      expect(result).toEqual(new Residence(ResidenceType.JOINT_OWN_HOME, ''));
    });
  });
});
