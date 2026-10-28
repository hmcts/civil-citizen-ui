import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from 'services/features/response/admission/paymentOptionService';
import {PaymentOptionType}
  from 'common/form/models/admission/paymentOption/paymentOptionType';
import {PaymentOption}
  from 'common/form/models/admission/paymentOption/paymentOption';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'common/form/models/responseType';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {mockClaim} from '../../../../../utils/mockClaim';
import {FullAdmission} from 'common/models/fullAdmission';
import {YesNo} from 'common/form/models/yesNo';
import {AppRequest} from 'models/AppRequest';

jest.mock('modules/draft-store/response/responseDraftStoreService');

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

describe('payment option service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get payment option form when full admission', () => {
    it('should get populated form when data exists', async () => {
      const claim = createClaim(PaymentOptionType.IMMEDIATELY);

      const form = await getPaymentOptionForm(claim, ResponseType.FULL_ADMISSION);

      expect(form.paymentType).toBe(PaymentOptionType.IMMEDIATELY);
    });

    it('should get new form when payment option undefined', async () => {
      const form = await getPaymentOptionForm(new Claim(), ResponseType.FULL_ADMISSION);

      expect(form.paymentType).toBeUndefined();
    });
  });

  describe('save payment option when full admission', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.FULL_ADMISSION))
        .rejects.toThrow('[paymentOptionService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save payment option successfully with existing claim', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.FULL_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          fullAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({
              paymentOption: PaymentOptionType.BY_SET_DATE,
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should clear financial details when switching to immediate option if exists', async () => {
      const claim = new Claim();
      claim.fullAdmission = new FullAdmission();
      claim.statementOfMeans = {
        disability: {option: YesNo.YES},
      };
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.IMMEDIATELY), ResponseType.FULL_ADMISSION);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.statementOfMeans).toBeUndefined();
      expect(savedClaim.fullAdmission?.paymentIntention?.paymentOption).toBe(PaymentOptionType.IMMEDIATELY);
    });
  });

  describe('get payment option form when part admission', () => {
    it('should get populated form when data exists', async () => {
      const claim = createPartialAdmissionClaim(PaymentOptionType.INSTALMENTS);

      const form = await getPaymentOptionForm(claim, ResponseType.PART_ADMISSION);

      expect(form.paymentType).toBe(PaymentOptionType.INSTALMENTS);
    });

    it('should get new form when payment option undefined', async () => {
      const form = await getPaymentOptionForm(new Claim(), ResponseType.PART_ADMISSION);

      expect(form.paymentType).toBeUndefined();
    });
  });

  describe('save payment option when part admission', () => {
    it('should save payment option successfully with existing claim', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(mockClaim as Claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({
              paymentOption: PaymentOptionType.BY_SET_DATE,
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should save payment option successfully and remove payment date if the option different than set by date', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(mockClaim as Claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.IMMEDIATELY), ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({
              paymentOption: PaymentOptionType.IMMEDIATELY,
              paymentDate: undefined,
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should save payment option successfully with no payment intention in draft store', async () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({
              paymentOption: PaymentOptionType.BY_SET_DATE,
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should clear financial details when switching to immediate option if exists', async () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.statementOfMeans = {
        disability: {option: YesNo.YES},
      };
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.IMMEDIATELY), ResponseType.PART_ADMISSION);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.statementOfMeans).toBeUndefined();
      expect(savedClaim.partialAdmission?.paymentIntention?.paymentOption).toBe(PaymentOptionType.IMMEDIATELY);
    });

    it('should throw error when draft store throws error', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(savePaymentOptionData(mockReq, new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.FULL_ADMISSION))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim(paymentOption: PaymentOptionType) {
  const claim = new Claim();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  return claim;
}

function createPartialAdmissionClaim(paymentOption: PaymentOptionType) {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOption;
  return claim;
}
