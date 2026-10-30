import {mockClaim} from '../../../../../utils/mockClaim';
import {saveResponseType} from '../../../../../../main/services/features/response/responseType/citizenResponseTypeService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from 'common/form/models/yesNo';
import {Mediation} from 'common/models/mediation/mediation';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');

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

describe('citizenResponseTypeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save responsetype = "PART_ADMISSION"', () => {
    it('should save data successfully', async () => {
      const claim = Object.assign(new Claim(), mockClaim);
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveResponseType(mockReq, ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          respondent1: expect.objectContaining({responseType: ResponseType.PART_ADMISSION}),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.partialAdmission?.paymentIntention?.paymentOption).toBeUndefined();
    });
  });

  describe('save responsetype = "FULL_ADMISSION"', () => {
    it('should save data successfully and clear previous response type settings', async () => {
      const claim = Object.assign(new Claim(), mockClaim);
      claim.directionQuestionnaire = {
        defendantYourselfEvidence: {
          option: 'yes',
        },
      } as DirectionQuestionnaire;
      claim.mediation = {
        canWeUse: {
          option: YesNo.YES,
        },
      } as Mediation;
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveResponseType(mockReq, ResponseType.FULL_ADMISSION);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.respondent1?.responseType).toEqual(ResponseType.FULL_ADMISSION);
      expect(savedClaim.partialAdmission?.howMuchDoYouOwe?.totalAmount).toBeUndefined();
      expect(savedClaim.directionQuestionnaire).toBeUndefined();
      expect(savedClaim.mediation).toBeUndefined();
    });
  });

  describe('save responsetype = "FULL_DEFENCE"', () => {
    it('should save data successfully', async () => {
      const claim = Object.assign(new Claim(), mockClaim);
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveResponseType(mockReq, ResponseType.FULL_DEFENCE);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.respondent1?.responseType).toEqual(ResponseType.FULL_DEFENCE);
      expect(savedClaim.partialAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
      expect(savedClaim.fullAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
    });
  });

  describe('save responseType when respondent1 is not set', () => {
    it('should save data successfully', async () => {
      const claim = new Claim();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveResponseType(mockReq, ResponseType.FULL_DEFENCE);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.respondent1?.responseType).toEqual(ResponseType.FULL_DEFENCE);
      expect(savedClaim.partialAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
      expect(savedClaim.fullAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
    });
  });

  it('should throw when no response draft is found', async () => {
    mockGetResponseDraft.mockResolvedValue(null);

    await expect(saveResponseType(mockReq, ResponseType.PART_ADMISSION))
      .rejects.toThrow('[citizenResponseTypeService] no draft response found');
    expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
  });

  it('should throw error when retrieving data from draft store fails', async () => {
    mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await expect(saveResponseType(mockReq, ResponseType.FULL_DEFENCE))
      .rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
