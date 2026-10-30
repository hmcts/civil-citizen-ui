import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from 'services/features/response/admission/whyDoYouDisagreeService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {PartialAdmission} from 'models/partialAdmission';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';
import * as claimDetailsService from 'modules/claimDetailsService';

jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');
jest.mock('modules/claimDetailsService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;
const mockGetTotalAmountWithInterest = claimDetailsService.getTotalAmountWithInterest as jest.Mock;

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

describe('why do you disagree service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTotalAmountWithInterest.mockResolvedValue(110);
  });

  describe('get text form', () => {
    it('should get text form when data exists Partial Admission', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim('Test'));

      const form = await getWhyDoYouDisagreeForm(mockReq, ResponseType.PART_ADMISSION);

      expect(form.whyDoYouDisagree.text).toBe('Test');
      expect(form.claimAmount).toBe(110);
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should get new form when text is empty Partial Admission', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim(''));

      const form = await getWhyDoYouDisagreeForm(mockReq, ResponseType.PART_ADMISSION);

      expect(form.whyDoYouDisagree.text).toMatch('');
    });

    it('should get new form when text undefined Partial Admission', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getWhyDoYouDisagreeForm(mockReq, ResponseType.PART_ADMISSION);

      expect(form.whyDoYouDisagree.text).toBeUndefined();
    });

    it('should get new form when text is empty Full Rejection', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim(''));

      const form = await getWhyDoYouDisagreeForm(mockReq, ResponseType.FULL_DEFENCE);

      expect(form.whyDoYouDisagree.text).toBeUndefined();
    });

    it('should get text form when data exists Full Rejection', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaimFullRejection('Test'));

      const form = await getWhyDoYouDisagreeForm(mockReq, ResponseType.FULL_DEFENCE);

      expect(form.whyDoYouDisagree.text).toBe('Test');
    });

    it('should throw an error when error is thrown from draft store', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getWhyDoYouDisagreeForm(mockReq, ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save text', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveWhyDoYouDisagreeData(mockReq, new WhyDoYouDisagree('Test'), ResponseType.PART_ADMISSION))
        .rejects.toThrow('[whyDoYouDisagreeService] no draft response found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save text successfully with existing claim Partial admission', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(createPartialAdmission()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveWhyDoYouDisagreeData(mockReq, new WhyDoYouDisagree('Test'), ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            whyDoYouDisagree: expect.objectContaining({text: 'Test'}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when Partial Admission does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveWhyDoYouDisagreeData(mockReq, new WhyDoYouDisagree('Test'), ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            whyDoYouDisagree: expect.objectContaining({text: 'Test'}),
          }),
        }),
        'draft-123',
      );
    });

    it('should save text successfully with existing claim Full Rejection', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(createFullRejection()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveWhyDoYouDisagreeData(mockReq, new WhyDoYouDisagree('Test'), ResponseType.FULL_DEFENCE);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({
            whyDoYouDisagree: expect.objectContaining({text: 'Test'}),
          }),
        }),
        'draft-123',
      );
    });

    it('should save when Full Rejection does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveWhyDoYouDisagreeData(mockReq, new WhyDoYouDisagree('Test'), ResponseType.FULL_DEFENCE);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({
            whyDoYouDisagree: expect.objectContaining({text: 'Test'}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw error when draft store throws error', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(createPartialAdmission()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveWhyDoYouDisagreeData(mockReq, new WhyDoYouDisagree(), ResponseType.PART_ADMISSION))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim(text: string) {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(text);
  return claim;
}

function createPartialAdmission() {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  return claim;
}

function createClaimFullRejection(text: string) {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree(text);
  return claim;
}

function createFullRejection() {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  return claim;
}
