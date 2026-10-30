import {Claim} from '../../../../../../../main/common/models/claim';
import {
  PartialAdmissionService,
} from '../../../../../../../main/services/features/response/admission/partialAdmission/partialAdmissionService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../../../main/modules/draft-store/response/responseDraftStoreService');

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

const partialAdmissionService = new PartialAdmissionService();

describe('partial admission service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('claim already paid', () => {
    describe('get claim already paid', () => {
      it('should return undefined if already paid is not set', async () => {
        mockGetResponseClaimById.mockResolvedValue(new Claim());

        const alreadyPaid = await partialAdmissionService.getClaimAlreadyPaid(mockReq);

        expect(alreadyPaid).toBeUndefined();
        expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      });

      it('should get a value if already paid is set to true', async () => {
        const claim = new Claim();
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'Yes',
          },
        };
        mockGetResponseClaimById.mockResolvedValue(claim);

        const alreadyPaid = await partialAdmissionService.getClaimAlreadyPaid(mockReq);

        expect(alreadyPaid).toBe('Yes');
      });

      it('should get a value if already paid is set to false', async () => {
        const claim = new Claim();
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'No',
          },
        };
        mockGetResponseClaimById.mockResolvedValue(claim);

        const alreadyPaid = await partialAdmissionService.getClaimAlreadyPaid(mockReq);

        expect(alreadyPaid).toBe('No');
      });
    });

    describe('save claim already paid', () => {
      it('should save successfully when already paid is not previously set', async () => {
        mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
        mockUpdateResponseDraft.mockResolvedValue({});

        await partialAdmissionService.saveClaimAlreadyPaid(mockReq, 'Yes');

        expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
          mockReq,
          caseId,
          expect.objectContaining({
            partialAdmission: expect.objectContaining({
              alreadyPaid: expect.objectContaining({option: 'Yes'}),
            }),
            draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
          'draft-123',
        );
      });

      it('should save successfully when already paid is previously set', async () => {
        const claim = new Claim();
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'No',
          },
        };
        mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
        mockUpdateResponseDraft.mockResolvedValue({});

        await partialAdmissionService.saveClaimAlreadyPaid(mockReq, 'Yes');

        const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
        expect(savedClaim.partialAdmission?.alreadyPaid?.option).toBe('Yes');
        expect(savedClaim.partialAdmission?.paymentIntention).toBeUndefined();
      });

      it('should throw when no response draft is found', async () => {
        mockGetResponseDraft.mockResolvedValue(null);

        await expect(partialAdmissionService.saveClaimAlreadyPaid(mockReq, 'Yes'))
          .rejects.toThrow('[partialAdmissionService] no draft response found');
        expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
      });

      it('should throw an error when updateResponseDraft fails', async () => {
        mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
        mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

        await expect(partialAdmissionService.saveClaimAlreadyPaid(mockReq, 'Yes'))
          .rejects.toThrow(TestMessages.REDIS_FAILURE);
      });
    });
  });
});
