import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from '../../../../../../../main/services/features/response/admission/partialAdmission/howMuchDoYouOweService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from '../../../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../../../main/common/models/partialAdmission';
import {HowMuchDoYouOwe} from '../../../../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as interestUtils from 'common/utils/interestUtils';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../../../main/modules/draft-store/response/responseDraftStoreService');
jest.mock('common/utils/interestUtils');

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

const AMOUNT = 12.9;
const TOTAL_AMOUNT = 110;

describe('Partial Admit - How much money do you admit you owe? Service ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockGetInterestData = interestUtils.getInterestData as jest.Mock;
    mockGetInterestData.mockResolvedValue(undefined);
  });

  describe('getHowMuchDoYouOweForm', () => {
    it('should get empty form when partial Admission does not exist', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getHowMuchDoYouOweForm(mockReq, 'en');

      expect(form.amount).toBe(undefined);
      expect(form.totalAmount).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return an empty form when howMuchDoYouOwe does not exist', async () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getHowMuchDoYouOweForm(mockReq, 'en');

      expect(form.amount).toBe(undefined);
      expect(form.totalAmount).toBeUndefined();
    });

    it('should return populated form when howMuchDoYouOwe exists', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_AMOUNT;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(AMOUNT);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getHowMuchDoYouOweForm(mockReq, 'en');

      expect(form.amount).toBeTruthy();
      expect(form.amount).toBe(AMOUNT);
      expect(form.totalAmount).toBe(TOTAL_AMOUNT);
    });

    it('should throw error when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getHowMuchDoYouOweForm(mockReq, 'en')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveHowMuchDoYouOweData', () => {
    it('should save data successfully when claim exists but no partial admissions', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveHowMuchDoYouOweData(mockReq, new HowMuchDoYouOwe(AMOUNT, TOTAL_AMOUNT));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            howMuchDoYouOwe: expect.objectContaining({amount: AMOUNT, totalAmount: TOTAL_AMOUNT}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveHowMuchDoYouOweData(mockReq, new HowMuchDoYouOwe(AMOUNT, TOTAL_AMOUNT)))
        .rejects.toThrow('[howMuchDoYouOweService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should throw an error when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveHowMuchDoYouOweData(mockReq, new HowMuchDoYouOwe(AMOUNT, TOTAL_AMOUNT)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
